import type { WeeklyRewardDropConfig } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

export interface ReferralConfig {
  rewardCents: number;
  minDepositCents: number;
  minGameplayCents: number;
  milestones: number[];
}

export interface TierCreditsConfig {
  centsPerCredit: number;
}

export interface MysteryBoxConfig {
  minWeeklyGameplayCents: number;
}

export interface UsernameConfig {
  freeChangeDays: number;
  paidChangeCredits: number;
}

export interface GameStatusConfig {
  delayed: string;
  postponed: string;
  cancelled: string;
  forfeit: string;
}

export interface EcosystemAdminConfig {
  referral: ReferralConfig;
  tier_credits: TierCreditsConfig;
  mystery_box: MysteryBoxConfig;
  weekly_reward_drop: WeeklyRewardDropConfig;
  username: UsernameConfig;
  game_status: GameStatusConfig;
}

export const DEFAULT_WEEKLY_REWARD_DROP_CONFIG: WeeklyRewardDropConfig = {
  minWeeklyGameplayCents: 50000,
  enabled: true,
  dropRates: {
    bronze: { common: 80, rare: 15, epic: 5, legendary: 0, mythic: 0 },
    silver: { common: 60, rare: 30, epic: 9, legendary: 1, mythic: 0 },
    gold: { common: 45, rare: 35, epic: 15, legendary: 5, mythic: 0 },
    diamond: { common: 35, rare: 35, epic: 20, legendary: 9, mythic: 1 },
    legend: { common: 25, rare: 35, epic: 25, legendary: 10, mythic: 5 },
    immortal: { common: 15, rare: 30, epic: 30, legendary: 15, mythic: 10 },
  },
  tierBoxMap: {
    rookie: "bronze",
    contender: "bronze",
    "all-star": "silver",
    champion: "silver",
    elite: "gold",
    legend: "diamond",
    "hall-of-fame": "legend",
    immortal: "immortal",
  },
  specialSurpriseChancePct: 0.5,
};

export const DEFAULT_ECOSYSTEM_CONFIG: EcosystemAdminConfig = {  referral: {
    rewardCents: 1000,
    minDepositCents: 2500,
    minGameplayCents: 1500,
    milestones: [5, 10, 25, 50, 100, 250, 500, 1000],
  },
  tier_credits: { centsPerCredit: 100 },
  mystery_box: { minWeeklyGameplayCents: 50000 },
  weekly_reward_drop: DEFAULT_WEEKLY_REWARD_DROP_CONFIG,
  username: { freeChangeDays: 90, paidChangeCredits: 500 },
  game_status: {
    delayed: "pause_payouts",
    postponed: "preserve_entries",
    cancelled: "refund",
    forfeit: "official_ruling",
  },
};
