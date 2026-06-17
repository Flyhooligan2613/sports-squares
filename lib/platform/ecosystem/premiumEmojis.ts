import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import {
  computeWithdrawableCents,
  debitBalance,
  getWalletBalances,
} from "@/lib/platform/engines/payment/wallet/WalletLedgerService";
import { ensureSquareWallet } from "@/lib/platform/engines/payment/wallet/WalletLifecycleService";
import { trackLifetimePurchase } from "@/lib/platform/ecosystem/progression";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";

export interface PremiumEmojiCatalogItem {
  id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  cashCents: number;
  creditCost: number;
  packSlugs: string[];
  sortOrder: number;
}

export interface PremiumEmojiShopState {
  catalog: PremiumEmojiCatalogItem[];
  ownedSlugs: string[];
  ownedEmojis: string[];
  walletAvailableCents: number;
}

function mapCatalog(row: Record<string, unknown>): PremiumEmojiCatalogItem {
  return {
    id: row.id as string,
    slug: row.slug as string,
    emoji: row.emoji as string,
    title: row.title as string,
    description: row.description as string,
    cashCents: Number(row.cash_cents),
    creditCost: Number(row.credit_cost),
    packSlugs: (row.pack_slugs as string[]) ?? [],
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function formatPremiumEmojiPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export async function listPremiumEmojiCatalog(): Promise<PremiumEmojiCatalogItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("premium_emojis")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapCatalog(row as Record<string, unknown>));
}

export async function getPremiumEmojiBySlug(slug: string): Promise<PremiumEmojiCatalogItem | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("premium_emojis")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCatalog(data as Record<string, unknown>) : null;
}

export async function getOwnedPremiumEmojiSlugs(email: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_premium_emojis")
    .select("premium_emoji_id, premium_emojis(slug)")
    .eq("email", normalizeEmail(email));

  if (error) throw error;

  const slugs = new Set<string>();
  for (const row of data ?? []) {
    const nested = row.premium_emojis as { slug?: string } | { slug?: string }[] | null;
    const slug = Array.isArray(nested) ? nested[0]?.slug : nested?.slug;
    if (slug) slugs.add(slug);
  }
  return Array.from(slugs);
}

export async function getOwnedPremiumEmojiChars(email: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_premium_emojis")
    .select("premium_emojis(emoji)")
    .eq("email", normalizeEmail(email));

  if (error) throw error;

  const emojis = new Set<string>();
  for (const row of data ?? []) {
    const nested = row.premium_emojis as { emoji?: string } | { emoji?: string }[] | null;
    const emoji = Array.isArray(nested) ? nested[0]?.emoji : nested?.emoji;
    if (emoji) emojis.add(emoji);
  }
  return Array.from(emojis);
}

export async function isPremiumEmojiOwned(email: string, slug: string): Promise<boolean> {
  const owned = await getOwnedPremiumEmojiSlugs(email);
  return owned.includes(slug);
}

async function resolveGrantSlugs(item: PremiumEmojiCatalogItem): Promise<string[]> {
  if (item.packSlugs.length > 0) {
    return item.packSlugs;
  }
  return [item.slug];
}

async function grantPremiumEmojiOwnership(input: {
  email: string;
  slug: string;
  source: "wallet" | "credits";
  amountPaidCents?: number | null;
  creditsSpent?: number | null;
}): Promise<void> {
  const item = await getPremiumEmojiBySlug(input.slug);
  if (!item) throw new Error("Premium emoji not found.");

  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(input.email);
  const grantSlugs =
    input.slug === item.slug ? await resolveGrantSlugs(item) : [input.slug];

  for (const grantSlug of grantSlugs) {
    const grantItem = await getPremiumEmojiBySlug(grantSlug);
    if (!grantItem) continue;

    const { data: existing } = await supabase
      .from("player_premium_emojis")
      .select("id")
      .eq("email", normalized)
      .eq("premium_emoji_id", grantItem.id)
      .maybeSingle();

    if (existing) continue;

    await supabase.from("player_premium_emojis").insert({
      email: normalized,
      premium_emoji_id: grantItem.id,
      source: input.source,
      amount_paid_cents: input.amountPaidCents ?? null,
      credits_spent: input.creditsSpent ?? null,
    });

    await addInventoryItem({
      email: normalized,
      itemType: "cosmetic",
      title: `Premium Emoji: ${grantItem.title}`,
      metadata: { emoji: grantItem.emoji, slug: grantItem.slug, kind: "premium_emoji" },
      source: input.source === "wallet" ? "premium_emoji_shop" : "credit_shop",
    });
  }
}

export async function grantPremiumEmojiFromCredits(input: {
  email: string;
  emojiSlug?: string;
  emojiSlugs?: string[];
  creditsSpent: number;
  catalogSlug?: string;
}): Promise<void> {
  const slugs = input.emojiSlugs?.length
    ? input.emojiSlugs
    : input.emojiSlug
      ? [input.emojiSlug]
      : [];

  if (!slugs.length) throw new Error("Premium emoji slug required.");

  const packSlug = input.emojiSlug && slugs.length > 1 ? input.emojiSlug : slugs[0];

  if (slugs.length > 1) {
    const pack = await getPremiumEmojiBySlug(packSlug);
    if (pack) {
      const owned = await getOwnedPremiumEmojiSlugs(input.email);
      const missing = slugs.filter((s) => !owned.includes(s));
      if (!missing.length) {
        throw new Error("You already own all emojis in this pack.");
      }
      await grantPremiumEmojiOwnership({
        email: input.email,
        slug: packSlug,
        source: "credits",
        creditsSpent: input.creditsSpent,
      });
      return;
    }
  }

  for (const slug of slugs) {
    if (await isPremiumEmojiOwned(input.email, slug)) {
      throw new Error("You already own this premium emoji.");
    }
  }

  await grantPremiumEmojiOwnership({
    email: input.email,
    slug: slugs[0],
    source: "credits",
    creditsSpent: input.creditsSpent,
  });
}

export async function purchasePremiumEmojiWithWallet(input: {
  email: string;
  slug: string;
}): Promise<{ emoji: string; grantedSlugs: string[] }> {
  const item = await getPremiumEmojiBySlug(input.slug);
  if (!item) throw new Error("Premium emoji not found.");

  const grantSlugs = await resolveGrantSlugs(item);
  const owned = await getOwnedPremiumEmojiSlugs(input.email);

  if (grantSlugs.every((s) => owned.includes(s))) {
    throw new Error("You already own this premium emoji.");
  }

  const wallet = await ensureSquareWallet(input.email);
  if (wallet.status !== "active") {
    throw new Error("SquareWallet is not active.");
  }

  const { walletId, balances } = await getWalletBalances(input.email);
  if (!walletId) {
    throw new Error("SquareWallet not found.");
  }

  const available = computeWithdrawableCents(balances);
  if (available < item.cashCents) {
    throw new Error(
      `Insufficient wallet balance. Need ${formatPremiumEmojiPrice(item.cashCents)} available cash.`
    );
  }

  await debitBalance({
    email: input.email,
    walletId,
    balanceType: "available",
    amountCents: item.cashCents,
    entryType: "adjustment",
    referenceType: "premium_emoji",
    referenceId: item.id,
    description: `Premium emoji: ${item.title}`,
    metadata: { slug: item.slug, emoji: item.emoji },
  });

  await recordPaymentTransaction({
    playerEmail: input.email,
    provider: getPaymentProviderId(),
    walletType: "available",
    transactionType: "wallet_transfer",
    amountCents: item.cashCents,
    status: "completed",
    idempotencyKey: `premium_emoji_${item.slug}_${normalizeEmail(input.email)}`,
    auditAction: "premium_emoji_purchase",
    auditDetail: `Premium emoji purchase: ${item.title}`,
  });

  await trackLifetimePurchase(input.email, item.cashCents);

  await grantPremiumEmojiOwnership({
    email: input.email,
    slug: item.slug,
    source: "wallet",
    amountPaidCents: item.cashCents,
  });

  return { emoji: item.emoji, grantedSlugs: grantSlugs };
}

export async function getPremiumEmojiShopState(email: string): Promise<PremiumEmojiShopState> {
  const [catalog, ownedSlugs, ownedEmojis, { balances }] = await Promise.all([
    listPremiumEmojiCatalog(),
    getOwnedPremiumEmojiSlugs(email),
    getOwnedPremiumEmojiChars(email),
    getWalletBalances(email),
  ]);

  return {
    catalog,
    ownedSlugs,
    ownedEmojis,
    walletAvailableCents: computeWithdrawableCents(balances),
  };
}

export async function canUseAvatarEmoji(email: string, emoji: string): Promise<boolean> {
  const { PLAYER_AVATARS } = await import("@/lib/platform/ecosystem/avatars");
  if ((PLAYER_AVATARS as readonly string[]).includes(emoji)) return true;
  const owned = await getOwnedPremiumEmojiChars(email);
  return owned.includes(emoji);
}
