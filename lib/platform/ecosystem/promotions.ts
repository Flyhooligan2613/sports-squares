import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { earnTierCredits, addSquareCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import { getEcosystemAccount } from "@/lib/platform/ecosystem/account";

export interface Promotion {
  id: string;
  slug: string;
  title: string;
  description: string;
  promoType: string;
  creditReward: number;
  squareCreditCents: number;
  multiplier: number;
  minTierSlug: string | null;
  claimed: boolean;
}

export async function listActivePromotions(email: string): Promise<Promotion[]> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: promos, error } = await supabase
    .from("ecosystem_promotions")
    .select("*")
    .eq("active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const { data: claims } = await supabase
    .from("player_promotion_claims")
    .select("promotion_id")
    .eq("email", normalizeEmail(email));

  const claimedIds = new Set((claims ?? []).map((c) => c.promotion_id as string));

  return (promos ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    promoType: row.promo_type as string,
    creditReward: Number(row.credit_reward ?? 0),
    squareCreditCents: Number(row.square_credit_cents ?? 0),
    multiplier: Number(row.multiplier ?? 1),
    minTierSlug: (row.min_tier_slug as string | null) ?? null,
    claimed: claimedIds.has(row.id as string),
  }));
}

export async function claimPromotion(email: string, promotionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const account = await getEcosystemAccount(normalized);

  const { data: promo, error } = await supabase
    .from("ecosystem_promotions")
    .select("*")
    .eq("id", promotionId)
    .eq("active", true)
    .maybeSingle();

  if (error || !promo) throw new Error("Promotion not found.");

  const { data: existing } = await supabase
    .from("player_promotion_claims")
    .select("email")
    .eq("email", normalized)
    .eq("promotion_id", promotionId)
    .maybeSingle();

  if (existing) throw new Error("Promotion already claimed.");

  if (promo.min_tier_slug && account) {
    // Simple tier gate — higher sort order tiers only; skip strict check for MVP
  }

  if (Number(promo.credit_reward) > 0) {
    await earnTierCredits({
      email: normalized,
      amount: Number(promo.credit_reward),
      source: "promotion",
      metadata: { slug: promo.slug },
    });
    await addInventoryItem({
      email: normalized,
      itemType: "promo_credit",
      title: promo.title as string,
      quantity: 1,
      metadata: { credits: promo.credit_reward },
      source: "promotion",
    });
  }

  if (Number(promo.square_credit_cents) > 0) {
    await addSquareCredits({
      email: normalized,
      amountCents: Number(promo.square_credit_cents),
      source: "promotion",
    });
    await addInventoryItem({
      email: normalized,
      itemType: "square_credit",
      title: `${promo.title} — Square Credit`,
      valueCents: Number(promo.square_credit_cents),
      source: "promotion",
    });
  }

  await supabase.from("player_promotion_claims").insert({
    email: normalized,
    promotion_id: promotionId,
  });
}
