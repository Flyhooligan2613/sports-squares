export type GenesisMissionId =
  | "complete_profile"
  | "join_first_contest"
  | "follow_three_competitors"
  | "upload_profile_picture"
  | "visit_trophy_room"
  | "open_community_feed"
  | "view_todays_contests"
  | "complete_first_contest";

export type GenesisMissionStatus = "pending" | "completed";

export type GenesisScreenContext =
  | "profile"
  | "my_games"
  | "contest_center"
  | "trophy_room"
  | "community"
  | "achievements"
  | "dashboard";

export type GenesisStarterAchievementId =
  | "genesis_welcome"
  | "genesis_official_competitor"
  | "genesis_account_created"
  | "genesis_career_started"
  | "genesis_profile_created";

export interface GenesisMissionReward {
  type: "xp" | "badge" | "avatar_frame" | "tier_credits";
  label: string;
  amount?: number;
  itemId?: string;
}

export interface GenesisMissionDefinition {
  id: GenesisMissionId;
  title: string;
  description: string;
  emoji: string;
  sortOrder: number;
  xpReward: number;
  rewards: GenesisMissionReward[];
  unlockAfter?: GenesisMissionId[];
}

export interface GenesisMissionProgress {
  missionId: GenesisMissionId;
  status: GenesisMissionStatus;
  completedAt: string | null;
  xpAwarded: number;
  rewardMetadata: Record<string, unknown>;
}

export interface GenesisStarterAchievement {
  id: GenesisStarterAchievementId;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: string;
}

export interface RookieSeasonState {
  active: boolean;
  startedAt: string | null;
  endsAt: string | null;
  daysRemaining: number | null;
}

export interface GenesisCareerProgress {
  rankTitle: string;
  progressPct: number;
  nextGoal: string;
  missionsCompleted: number;
  missionsTotal: number;
  xpEarned: number;
  xpTotal: number;
}

export interface GenesisNextStep {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  missionId?: GenesisMissionId;
  emoji: string;
}

export interface GenesisProgressSnapshot {
  initialized: boolean;
  rookieSeason: RookieSeasonState;
  missions: GenesisMissionProgress[];
  starterAchievements: GenesisStarterAchievement[];
  career: GenesisCareerProgress;
  motivation: string;
  customizationUnlocked: boolean;
  startingCompetitorScore: number;
  firstWinPendingCelebration: boolean;
  firstLossPendingEncouragement: boolean;
}

export interface GenesisCompleteMissionResult {
  ok: boolean;
  mission?: GenesisMissionProgress;
  xpAwarded?: number;
  alreadyCompleted?: boolean;
  error?: string;
}
