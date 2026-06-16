import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { addSquareCredits, earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SquarePassGrantedReward, SquarePassRewardDef } from "./types";

export async function distributeRewards(
  email: string,
  rewards: SquarePassRewardDef[],
  source: string
): Promise<SquarePassGrantedReward[]> {
  const granted: SquarePassGrantedReward[] = [];
  const normalized = normalizeEmail(email);

  for (const reward of rewards) {
    const type = normalizeRewardType(reward.type);

    if (type === "xp" && reward.amount) {
      await earnTierCredits({
        email: normalized,
        amount: reward.amount,
        source,
        metadata: { squarePass: true, rewardLabel: reward.label },
      });
      granted.push({ type: "xp", label: reward.label, amount: reward.amount });
    }

    if ((type === "badge" || type === "badges") && reward.itemId) {
      await addInventoryItem({
        email: normalized,
        itemType: "badge",
        title: reward.label,
        metadata: { badgeId: reward.itemId, source },
        source,
      });
      granted.push({ type: "badge", label: reward.label, itemId: reward.itemId });
    }

    if ((type === "profile_frame" || type === "profile_frames") && reward.itemId) {
      await addInventoryItem({
        email: normalized,
        itemType: "cosmetic",
        title: reward.label,
        metadata: { frameId: reward.itemId, source },
        source,
      });
      await updateEcosystemProfile(normalized, { profile_frame_id: reward.itemId });
      granted.push({ type: "profile_frame", label: reward.label, itemId: reward.itemId });
    }

    if (type === "contest_tickets" && reward.amount) {
      await addInventoryItem({
        email: normalized,
        itemType: "giveaway_ticket",
        title: reward.label,
        quantity: reward.amount,
        metadata: { ticketType: "contest_entry", source },
        source,
      });
      granted.push({ type: "contest_tickets", label: reward.label, amount: reward.amount });
    }

    if (type === "wallet_credits" && reward.amountCents) {
      const { SquareBankEngine } = await import("@/lib/platform/engines/squareBank");
      await SquareBankEngine.ensureAccount(normalized);
      const entryType = source.includes("referral")
        ? "referral_reward"
        : source.includes("square_pass") || source.includes("squarepass")
          ? "squarepass_reward"
          : "bonus_credit";
      const accountType =
        entryType === "referral_reward"
          ? "referral_credits"
          : entryType === "squarepass_reward"
            ? "reward_credits"
            : "bonus_credits";
      await SquareBankEngine.postEntry({
        email: normalized,
        accountType,
        direction: "credit",
        amountCents: reward.amountCents,
        entryType,
        description: reward.label,
        referenceType: "square_pass",
        referenceId: source,
        metadata: { squarePass: true, source },
        module: "square_pass",
      });
      await addSquareCredits({
        email: normalized,
        amountCents: reward.amountCents,
        source,
        metadata: { squarePass: true, squareBank: true },
      });
      granted.push({
        type: "wallet_credits",
        label: reward.label,
        amount: reward.amountCents,
      });
    }

    if (type === "marketplace_credits" && reward.amountCents) {
      await addInventoryItem({
        email: normalized,
        itemType: "promo_credit",
        title: reward.label,
        valueCents: reward.amountCents,
        metadata: { creditType: "marketplace", source },
        source,
      });
      granted.push({
        type: "marketplace_credits",
        label: reward.label,
        amount: reward.amountCents,
      });
    }

    if (type === "reward_drops" && reward.amount) {
      await addInventoryItem({
        email: normalized,
        itemType: "reward_token",
        title: reward.label,
        quantity: reward.amount,
        metadata: { dropType: "square_pass", source },
        source,
      });
      granted.push({ type: "reward_drops", label: reward.label, amount: reward.amount });
    }

    if (type === "themes" && reward.itemId) {
      await addInventoryItem({
        email: normalized,
        itemType: "cosmetic",
        title: reward.label,
        metadata: { themeId: reward.itemId, source },
        source,
      });
      granted.push({ type: "themes", label: reward.label, itemId: reward.itemId });
    }

    if (type === "legacy_boosts") {
      await addInventoryItem({
        email: normalized,
        itemType: "tier_reward",
        title: reward.label,
        metadata: { boostType: "legacy_spotlight", source },
        source,
      });
      granted.push({ type: "legacy_boosts", label: reward.label, amount: reward.amount ?? 1 });
    }

    if (type === "competitor_score_boost" && reward.amount) {
      const supabase = getSupabaseAdmin();
      const { data: profile } = await supabase
        .from("player_profiles")
        .select("competitor_score_bonus")
        .eq("email", normalized)
        .maybeSingle();
      const current = Number(profile?.competitor_score_bonus ?? 0);
      await updateEcosystemProfile(normalized, {
        competitor_score_bonus: current + reward.amount,
      });
      granted.push({
        type: "competitor_score_boost",
        label: reward.label,
        amount: reward.amount,
      });
    }
  }

  if (granted.length > 0) {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("square_pass_redemptions_count")
      .eq("email", normalized)
      .maybeSingle();
    const count = Number(profile?.square_pass_redemptions_count ?? 0);
    await updateEcosystemProfile(normalized, {
      square_pass_redemptions_count: count + 1,
    });
  }

  return granted;
}

function normalizeRewardType(type: string): string {
  if (type === "badges") return "badge";
  if (type === "profile_frames") return "profile_frame";
  return type;
}
