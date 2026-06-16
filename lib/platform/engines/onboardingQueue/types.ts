/** OnboardingQueue™ — Platform Build Spec #010 step identifiers. */
export type OnboardingModuleId =
  | "account_created"
  | "welcome"
  | "mystery_pass"
  | "reward_reveal"
  | "founder"
  | "birthday"
  | "flash_event"
  | "season_event"
  | "profile"
  | "missions"
  | "competitor_score"
  | "choose_journey"
  | "navigate_dashboard"
  /** Post-onboarding engagement (not in mandatory onboarding order). */
  | "daily_bonus"
  | "surprise";

export type OnboardingCompletionStatus =
  | "pending"
  | "completed"
  | "skipped"
  | "unavailable"
  | "expired"
  | "already_claimed";

export interface OnboardingModulePayload {
  founderNumber?: number;
  founderLimit?: number;
  flashEndsAt?: string | null;
  flashCampaignSlug?: string;
  surpriseSlug?: string;
  missions?: Array<{ id: string; title: string; emoji: string; completed: boolean }>;
  competitorScore?: {
    total: number;
    genesisStartingBonus?: number;
    rankTitle: string;
  };
  journeyOptions?: Array<{ id: string; title: string; emoji: string; href: string }>;
  birthdayRewardLabel?: string;
  seasonEventTitle?: string;
  seasonEventMessage?: string;
}

export interface OnboardingQueueStep {
  id: OnboardingModuleId;
  title: string;
  order: number;
  skippable: boolean;
  payload?: OnboardingModulePayload;
}

export interface OnboardingQueueState {
  email: string;
  currentStepId: OnboardingModuleId | null;
  completedSteps: OnboardingModuleId[];
  skippedSteps: OnboardingModuleId[];
  interruptedAt: string | null;
  version: number;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingQueueConfigRow {
  moduleId: OnboardingModuleId;
  enabled: boolean;
  orderOverride: number | null;
  delayMs: number;
  eligibilityJson: Record<string, unknown>;
  testingMode: boolean;
  updatedAt: string;
}

export interface OnboardingEligibilityContext {
  email: string;
  state: OnboardingQueueState;
  config: Map<OnboardingModuleId, OnboardingQueueConfigRow>;
  accountAgeHours: number;
  isLegacyAccount: boolean;
  founderEligible: boolean;
  dailyBonusAvailable: boolean;
  flashEvents: Array<{
    campaign: { slug: string };
    endsAt: string | null;
  }>;
  rookieSeasonActive: boolean;
  isBirthdayToday: boolean;
  seasonEventActive: boolean;
  debugMode: boolean;
}

export interface OnboardingModule {
  id: OnboardingModuleId;
  priority: number;
  order: number;
  title: string;
  skippable?: boolean;
  /** UI-only modules (e.g. navigate_dashboard) may omit render on server. */
  isEligible: (ctx: OnboardingEligibilityContext) => boolean | Promise<boolean>;
  buildPayload?: (
    ctx: OnboardingEligibilityContext
  ) => Promise<OnboardingModulePayload | undefined> | OnboardingModulePayload | undefined;
  onComplete?: (
    ctx: OnboardingEligibilityContext,
    metadata?: Record<string, unknown>
  ) => Promise<void> | void;
  onSkip?: (ctx: OnboardingEligibilityContext) => Promise<void> | void;
}

export interface OnboardingQueueResult {
  queue: OnboardingQueueStep[];
  state: OnboardingQueueState;
  nextModule: OnboardingQueueStep | null;
  debugMode: boolean;
}

export interface CompleteModuleInput {
  moduleId: OnboardingModuleId;
  metadata?: Record<string, unknown>;
}
