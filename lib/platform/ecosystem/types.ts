import type { PlatformGameId } from "@/lib/platform/gameTypes";

export type PlayerTierSlug =
  | "rookie"
  | "contender"
  | "all-star"
  | "champion"
  | "elite"
  | "legend"
  | "hall-of-fame"
  | "immortal";

export type ReferralStatus = "pending" | "qualified" | "rewarded" | "rejected";

export type CreditKind = "tier" | "square" | "pickem";

export interface EcosystemAccount {
  email: string;
  playerId: string;
  username: string | null;
  phone: string | null;
  displayName: string;
  slug: string;
  tierSlug: PlayerTierSlug;
  tierLevel: number;
  lifetimeTierCredits: number;
  availableTierCredits: number;
  weeklyTierCredits: number;
  weeklyGameplayCents: number;
  weeklyPeriodKey: string | null;
  squareCreditsCents: number;
  pickemCreditsCents: number;
  qualifiedReferrals: number;
  totalReferrals: number;
  mysteryBoxesOpened: number;
  rewardsRedeemed: number;
  profileFrameId: string | null;
  referredByCode: string | null;
  memberSince: string;
}

export interface TierDefinition {
  slug: PlayerTierSlug;
  displayName: string;
  sortOrder: number;
  minLifetimeCredits: number;
  benefits: string[];
  profileFrameId: string | null;
}

export interface RewardsCatalogItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  creditCost: number;
  rewardType: string;
  rewardValue: Record<string, unknown>;
  minTierSlug: string | null;
}

export interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  referralEarningsCents: number;
  milestones: { count: number; reached: boolean; rewarded: boolean }[];
  referrals: {
    id: string;
    refereeEmailMasked: string;
    status: ReferralStatus;
    qualifiedGameplayCents: number;
    createdAt: string;
  }[];
}

export interface EcosystemDashboard {
  account: EcosystemAccount;
  tier: TierDefinition;
  nextTier: TierDefinition | null;
  creditsToNextTier: number;
  tierProgressPct: number;
  referral: ReferralSummary;
  unopenedMysteryBox: boolean;
  recentCreditActivity: {
    id: string;
    entryType: "earn" | "spend";
    creditKind: CreditKind;
    amount: number;
    source: string;
    createdAt: string;
  }[];
}

export interface GameplayEvent {
  email: string;
  gameType: PlatformGameId;
  amountCents: number;
  isDeposit?: boolean;
  metadata?: Record<string, unknown>;
}
