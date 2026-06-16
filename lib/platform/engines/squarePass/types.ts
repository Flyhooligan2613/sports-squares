/** SquarePass™ reward payload — admin-configured JSON per campaign. */
export type SquarePassRewardType =
  | "xp"
  | "contest_tickets"
  | "reward_drops"
  | "profile_frames"
  | "badges"
  | "themes"
  | "legacy_boosts"
  | "competitor_score_boost"
  | "marketplace_credits"
  | "wallet_credits"
  | "badge"
  | "profile_frame";

export interface SquarePassRewardDef {
  type: SquarePassRewardType;
  amount?: number;
  amountCents?: number;
  itemId?: string;
  label: string;
  metadata?: Record<string, unknown>;
}

export type SquarePassCampaignType =
  | "signup"
  | "referral"
  | "promo"
  | "influencer"
  | "partner"
  | "launch"
  | "vip"
  | "seasonal"
  | "event";

export interface SquarePassEligibilityRules {
  newAccountsOnly?: boolean;
  requiresGenesis?: boolean;
  maxAgeHours?: number;
  regions?: string[];
  sports?: string[];
  milestones?: number[];
  minTier?: string;
}

export interface SquarePassCampaign {
  id: string;
  slug: string;
  name: string;
  campaignType: SquarePassCampaignType;
  description: string | null;
  rewards: SquarePassRewardDef[];
  startsAt: string | null;
  endsAt: string | null;
  usageLimitPerPlayer: number | null;
  totalRedemptionLimit: number | null;
  totalRedemptions: number;
  eligibilityRules: SquarePassEligibilityRules;
  active: boolean;
  autoActivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SquarePassCode {
  id: string;
  code: string;
  campaignId: string;
  usageLimitPerPlayer: number | null;
  maxRedemptions: number | null;
  currentRedemptions: number;
  eligibleSports: string[] | null;
  eligibleRegions: string[] | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface SquarePassRedemption {
  id: string;
  email: string;
  codeId: string | null;
  campaignId: string;
  codeString: string;
  rewardsGranted: SquarePassGrantedReward[];
  fraudFlags: string[];
  blocked: boolean;
  createdAt: string;
}

export interface SquarePassGrantedReward {
  type: SquarePassRewardType;
  label: string;
  amount?: number;
  itemId?: string;
}

export type SquarePassReferralStatus = "pending" | "qualified" | "rewarded" | "rejected";

export interface SquarePassReferral {
  id: string;
  referrerEmail: string;
  refereeEmail: string;
  referralCode: string;
  status: SquarePassReferralStatus;
  milestoneRewards: SquarePassGrantedReward[];
  qualifiedAt: string | null;
  rewardedAt: string | null;
  createdAt: string;
}

export interface SquarePassReferralMilestone {
  count: number;
  title: string;
  description: string;
  rewards: SquarePassRewardDef[];
  reached: boolean;
  rewarded: boolean;
}

export interface SquarePassMyReferral {
  personalCode: string;
  playerId: string;
  referralLink: string;
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  milestones: SquarePassReferralMilestone[];
  recentReferrals: Array<{
    id: string;
    refereeEmailMasked: string;
    status: SquarePassReferralStatus;
    createdAt: string;
  }>;
}

export interface SquarePassRedeemResult {
  ok: boolean;
  celebration: {
    title: string;
    message: string;
    rewards: SquarePassGrantedReward[];
  };
  campaign?: Pick<SquarePassCampaign, "slug" | "name" | "campaignType">;
}

export interface SquarePassSignupBonus {
  campaignSlug: string;
  campaignName: string;
  rewards: SquarePassGrantedReward[];
}

export interface SquarePassAnalytics {
  totalRedemptions: number;
  redemptionsToday: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  referralConversionRate: number;
  xpDistributed: number;
  walletCreditsDistributedCents: number;
  topCodes: Array<{ code: string; redemptions: number; campaignName: string }>;
  activeCampaigns: number;
  dataGaps: string[];
}

export interface CreateCampaignInput {
  slug: string;
  name: string;
  campaignType: SquarePassCampaignType;
  description?: string;
  rewards: SquarePassRewardDef[];
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimitPerPlayer?: number | null;
  totalRedemptionLimit?: number | null;
  eligibilityRules?: SquarePassEligibilityRules;
  active?: boolean;
  autoActivate?: boolean;
}

export interface CreateCodeInput {
  code: string;
  campaignId: string;
  usageLimitPerPlayer?: number | null;
  maxRedemptions?: number | null;
  eligibleSports?: string[];
  eligibleRegions?: string[];
  expiresAt?: string | null;
  active?: boolean;
}

export interface RedeemCodeInput {
  email: string;
  code: string;
  deviceKey?: string;
  ip?: string | null;
  region?: string | null;
  sport?: string | null;
}

export interface ApplyReferralInput {
  refereeEmail: string;
  referralCode: string;
  deviceKey?: string;
  ip?: string | null;
}
