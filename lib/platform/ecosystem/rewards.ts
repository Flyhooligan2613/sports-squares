import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { addSquareCredits, spendTierCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem, incrementLifetimeRewards } from "@/lib/platform/ecosystem/inventory";
import type { RewardsCatalogItem } from "@/lib/platform/ecosystem/types";
function mapCatalog(row: Record<string, unknown>): RewardsCatalogItem {
  return {
    id: row.id as string,
    slug: row.slug as string,
    category: row.category as string,
    title: row.title as string,
    description: row.description as string,
    creditCost: Number(row.credit_cost),
    rewardType: row.reward_type as string,
    rewardValue: (row.reward_value as Record<string, unknown>) ?? {},
    minTierSlug: (row.min_tier_slug as string | null) ?? null,
  };
}

export async function listRewardsCatalog(): Promise<RewardsCatalogItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ecosystem_rewards_catalog")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapCatalog(row as Record<string, unknown>));
}

export async function redeemReward(input: {
  email: string;
  catalogItemId: string;
}): Promise<{ redemptionId: string }> {
  const account = await ensureEcosystemAccount(input.email);
  const supabase = getSupabaseAdmin();

  const { data: item, error } = await supabase
    .from("ecosystem_rewards_catalog")
    .select("*")
    .eq("id", input.catalogItemId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  if (!item) throw new Error("Reward not found.");

  const catalog = mapCatalog(item as Record<string, unknown>);
  if (account.availableTierCredits < catalog.creditCost) {
    throw new Error("Not enough Tier Credits.");
  }

  await spendTierCredits({
    email: input.email,
    amount: catalog.creditCost,
    source: "rewards_marketplace",
    metadata: { slug: catalog.slug },
  });

  const { data: redemption, error: redeemError } = await supabase
    .from("ecosystem_reward_redemptions")
    .insert({
      email: normalizeEmail(input.email),
      catalog_item_id: catalog.id,
      credits_spent: catalog.creditCost,
      status: "pending",
      fulfillment: catalog.rewardValue,
    })
    .select("id")
    .single();

  if (redeemError) throw redeemError;

  if (catalog.rewardType === "square_credit") {
    const amountCents = Number(catalog.rewardValue.amountCents ?? 0);
    if (amountCents > 0) {
      await addSquareCredits({
        email: input.email,
        amountCents,
        source: "reward_redemption",
        metadata: { catalogSlug: catalog.slug },
      });
      await addInventoryItem({
        email: input.email,
        itemType: "square_credit",
        title: catalog.title,
        valueCents: amountCents,
        source: "credit_shop",
        metadata: { slug: catalog.slug },
      });
    }
  }

  if (catalog.rewardType === "pickem_entry") {
    const entryTierCents = Number(catalog.rewardValue.entryTierCents ?? 1000);
    const current = account.pickemCreditsCents;
    await updateEcosystemProfile(input.email, {
      pickem_credits_cents: current + entryTierCents,
    });
    await addInventoryItem({
      email: input.email,
      itemType: "pickem_entry",
      title: catalog.title,
      valueCents: entryTierCents,
      source: "credit_shop",
    });
  }

  if (catalog.rewardType === "bonus_square") {
    await addInventoryItem({
      email: input.email,
      itemType: "reward_token",
      title: catalog.title,
      quantity: Number(catalog.rewardValue.quantity ?? 1),
      source: "credit_shop",
      metadata: { slug: catalog.slug, redeemType: "bonus_square" },
    });
  }

  if (catalog.rewardType === "survivor_shield") {
    await addInventoryItem({
      email: input.email,
      itemType: "survivor_shield",
      title: catalog.title,
      quantity: Number(catalog.rewardValue.quantity ?? 1),
      source: "credit_shop",
      metadata: { slug: catalog.slug },
    });
  }

  await addInventoryItem({
    email: input.email,
    itemType: "tier_reward",
    title: `Redeemed: ${catalog.title}`,
    source: "marketplace",
    metadata: { redemptionId: redemption.id as string },
  });

  await incrementLifetimeRewards(input.email, catalog.creditCost);

  await supabase
    .from("ecosystem_reward_redemptions")
    .update({ status: "fulfilled" })
    .eq("id", redemption.id as string);

  return { redemptionId: redemption.id as string };
}
