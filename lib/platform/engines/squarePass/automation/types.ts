import type { SquarePassGrantedReward, SquarePassRewardDef } from "../types";

/** Ordered experience steps in the New Competitor Automated Experience™. */
export type SquarePassExperienceId =
  | "welcome"
  | "mystery"
  | "reward_reveal"
  | "founder"
  | "whats_next"
  | "profile_customization"
  | "daily_bonus"
  | "flash_event"
  | "surprise";

export interface SquarePassExperienceStep {
  id: SquarePassExperienceId;
  title: string;
  payload?: SquarePassExperiencePayload;
}

export interface SquarePassExperiencePayload {
  rewards?: SquarePassGrantedReward[];
  signupBonuses?: Array<{ campaignName: string; rewards: SquarePassGrantedReward[] }>;
  founderNumber?: number;
  founderLimit?: number;
  flashEndsAt?: string | null;
  flashCampaignSlug?: string;
  surpriseSlug?: string;
  missions?: Array<{ id: string; title: string; emoji: string; completed: boolean }>;
}

export interface SquarePassAutomationState {
  email: string;
  welcomeCompletedAt: string | null;
  mysteryRevealedAt: string | null;
  rewardRevealCompletedAt: string | null;
  founderClaimedAt: string | null;
  whatsNextCompletedAt: string | null;
  profileCustomizationCompletedAt: string | null;
  lastDailyBonusAt: string | null;
  flashEventsSeen: string[];
  surprisesClaimed: string[];
  experiencesCompleted: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SquarePassMysteryPoolEntry {
  id: string;
  slug: string;
  label: string;
  reward: SquarePassRewardDef;
  weight: number;
  active: boolean;
  sortOrder: number;
}

export interface SquarePassMysteryRevealResult {
  ok: true;
  poolSlug: string;
  label: string;
  celebration: {
    title: string;
    message: string;
    rewards: SquarePassGrantedReward[];
  };
}

export interface SquarePassAutomationQueueResult {
  queue: SquarePassExperienceStep[];
  state: Pick<
    SquarePassAutomationState,
    "welcomeCompletedAt" | "mysteryRevealedAt" | "lastDailyBonusAt"
  >;
}

export type SquarePassCompleteStepId = SquarePassExperienceId;
