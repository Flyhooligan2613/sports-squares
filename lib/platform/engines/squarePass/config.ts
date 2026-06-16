import type { SquarePassReferralMilestone, SquarePassRewardDef } from "./types";

/** Referral milestone thresholds — admin-overridable via campaign eligibility_rules.milestones. */
export const SQUARE_PASS_DEFAULT_MILESTONES = [1, 5, 10, 25, 50, 100] as const;

export const SQUARE_PASS_MILESTONE_REWARDS: Record<
  number,
  { title: string; description: string; rewards: SquarePassRewardDef[] }
> = {
  1: {
    title: "First Recruit",
    description: "Your first friend joined the roster.",
    rewards: [
      { type: "xp", amount: 100, label: "100 XP" },
      { type: "badge", itemId: "referral_recruit_1", label: "First Recruit Badge" },
    ],
  },
  5: {
    title: "Squad Builder",
    description: "Five competitors joined through your invite.",
    rewards: [
      { type: "xp", amount: 250, label: "250 XP" },
      { type: "profile_frame", itemId: "referral_frame_5", label: "Squad Builder Frame" },
    ],
  },
  10: {
    title: "Community Captain",
    description: "Ten friends are competing with you.",
    rewards: [
      { type: "xp", amount: 500, label: "500 XP" },
      { type: "badge", itemId: "referral_captain_10", label: "Community Captain Badge" },
    ],
  },
  25: {
    title: "Legacy Ambassador",
    description: "Twenty-five qualified referrals — elite community builder.",
    rewards: [
      { type: "competitor_score_boost", amount: 50, label: "+50 Competitor Score" },
      { type: "wallet_credits", amountCents: 1000, label: "$10 Platform Credits" },
    ],
  },
  50: {
    title: "Arena Recruiter",
    description: "Fifty friends on the platform — legendary influence.",
    rewards: [
      { type: "competitor_score_boost", amount: 100, label: "+100 Competitor Score" },
      { type: "profile_frame", itemId: "referral_frame_50", label: "Arena Recruiter Frame" },
    ],
  },
  100: {
    title: "SquareBoards Legend",
    description: "One hundred qualified referrals — hall-of-fame community status.",
    rewards: [
      { type: "competitor_score_boost", amount: 200, label: "+200 Competitor Score" },
      { type: "badge", itemId: "referral_legend_100", label: "SquareBoards Legend Badge" },
      { type: "legacy_boosts", amount: 1, label: "Legacy Spotlight Boost" },
    ],
  },
};

export function buildDefaultMilestones(
  qualifiedCount: number,
  rewardedCounts: Set<number>
): SquarePassReferralMilestone[] {
  return SQUARE_PASS_DEFAULT_MILESTONES.map((count) => {
    const def = SQUARE_PASS_MILESTONE_REWARDS[count];
    return {
      count,
      title: def?.title ?? `${count} Referrals`,
      description: def?.description ?? `Reach ${count} qualified referrals.`,
      rewards: def?.rewards ?? [],
      reached: qualifiedCount >= count,
      rewarded: rewardedCounts.has(count),
    };
  });
}

/** Exclusive-opportunity messaging — never discount framing. */
export const SQUARE_PASS_COPY = {
  redeemSuccess: "Exclusive opportunity unlocked.",
  redeemInvalid: "This code isn't available right now.",
  referralApplied: "You're connected — welcome to the roster.",
  signupBonus: "Your welcome opportunity is ready.",
} as const;
