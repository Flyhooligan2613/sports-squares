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
  username: UsernameConfig;
  game_status: GameStatusConfig;
}

export const DEFAULT_ECOSYSTEM_CONFIG: EcosystemAdminConfig = {
  referral: {
    rewardCents: 1000,
    minDepositCents: 2500,
    minGameplayCents: 1500,
    milestones: [5, 10, 25, 50, 100, 250, 500, 1000],
  },
  tier_credits: { centsPerCredit: 100 },
  mystery_box: { minWeeklyGameplayCents: 50000 },
  username: { freeChangeDays: 90, paidChangeCredits: 500 },
  game_status: {
    delayed: "pause_payouts",
    postponed: "preserve_entries",
    cancelled: "refund",
    forfeit: "official_ruling",
  },
};
