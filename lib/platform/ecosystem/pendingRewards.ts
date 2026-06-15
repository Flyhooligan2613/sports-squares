import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { addSquareCredits, earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem, incrementLifetimeRewards } from "@/lib/platform/ecosystem/inventory";
import { updateEcosystemProfile, ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";

export async function claimPendingReward(
  email: string,
  rewardId: string
): Promise<{ title: string }> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from("player_pending_rewards")
    .select("*")
    .eq("id", rewardId)
    .eq("email", normalized)
    .is("claimed_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!row) throw new Error("Reward not available to claim.");

  const value = (row.value as Record<string, unknown>) ?? {};
  const rewardType = row.reward_type as string;
  const title = row.title as string;

  switch (rewardType) {
    case "tier_credits": {
      const amount = Number(value.amount ?? 0);
      if (amount > 0) {
        await earnTierCredits({
          email,
          amount,
          source: "pending_reward",
          metadata: { rewardId, title },
        });
      }
      break;
    }
    case "square_credit": {
      const amountCents = Number(value.amountCents ?? value.amount ?? 0);
      if (amountCents > 0) {
        await addSquareCredits({
          email,
          amountCents,
          source: "pending_reward",
          metadata: { rewardId, title },
        });
      }
      break;
    }
    case "pickem_entry": {
      const entryTierCents = Number(value.entryTierCents ?? 1000);
      const account = await ensureEcosystemAccount(email);
      await updateEcosystemProfile(email, {
        pickem_credits_cents: account.pickemCreditsCents + entryTierCents,
      });
      break;
    }
    case "bonus_square":
    case "survivor_shield":
    case "reward_token":
    case "coupon":
      await addInventoryItem({
        email,
        itemType:
          rewardType === "survivor_shield"
            ? "survivor_shield"
            : rewardType === "bonus_square"
              ? "reward_token"
              : (rewardType as "coupon" | "reward_token"),
        title,
        quantity: Number(value.quantity ?? 1),
        valueCents: value.amountCents != null ? Number(value.amountCents) : null,
        source: row.source as string,
        metadata: { ...value, pendingRewardId: rewardId },
      });
      break;
    default:
      await addInventoryItem({
        email,
        itemType: "reward_token",
        title,
        quantity: 1,
        source: row.source as string,
        metadata: { ...value, pendingRewardId: rewardId, rewardType },
      });
      break;
  }

  await supabase
    .from("player_pending_rewards")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", rewardId);

  await incrementLifetimeRewards(email, Number(value.creditValue ?? 0));

  return { title };
}
