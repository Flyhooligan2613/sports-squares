import type { WeeklyRewardDropConfig } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import type { ContestCtaAdminConfig } from "@/lib/contestCenter/cta";
import { DEFAULT_CONTEST_CTA_CONFIG } from "@/lib/contestCenter/cta";

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
  contest_cta: ContestCtaAdminConfig;
}

export const DEFAULT_WEEKLY_REWARD_DROP_CONFIG: WeeklyRewardDropConfig = {
  minWeeklyGameplayCents: 0,
  enabled: true,
  dropRates: {
    bronze: { common: 80, rare: 15, epic: 5, legendary: 0, mythic: 0, immortal: 0 },
    silver: { common: 58, rare: 30, epic: 10, legendary: 2, mythic: 0, immortal: 0 },
    gold: { common: 42, rare: 35, epic: 15, legendary: 7, mythic: 1, immortal: 0 },
    diamond: { common: 32, rare: 33, epic: 20, legendary: 10, mythic: 4, immortal: 1 },
    legend: { common: 22, rare: 32, epic: 25, legendary: 12, mythic: 8, immortal: 1 },
    immortal: { common: 10, rare: 25, epic: 30, legendary: 18, mythic: 12, immortal: 5 },
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
  contest_cta: DEFAULT_CONTEST_CTA_CONFIG,
};
