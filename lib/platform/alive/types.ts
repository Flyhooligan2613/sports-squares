/** AliveEngine™ — shared types (Platform Build Spec #013) */

export type AliveDataSource = "real" | "estimated" | "fallback";

export interface AliveStat {
  label: string;
  value: string | number;
  emoji?: string;
  source: AliveDataSource;
  trend?: "up" | "down" | "neutral";
}

export interface PlatformPulse {
  updatedAt: string;
  stats: AliveStat[];
  playersOnline: number;
  isLive: boolean;
}

export interface PersonalPulse {
  updatedAt: string;
  displayName: string;
  competitorScore: number;
  competitorScoreRank: string | null;
  tierLabel: string;
  tierLevel: number;
  tierProgressPct: number;
  xpToNext: number;
  loginStreakDays: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  walletBalanceCents: number;
  pendingWinningsCents: number;
  dailyMissionsComplete: number;
  dailyMissionsTotal: number;
  squarePassActive: boolean;
  squarePassLabel: string | null;
  stats: AliveStat[];
}

export type AliveActivityKind =
  | "board_filled"
  | "contest_starting"
  | "winner_announced"
  | "contest_opened"
  | "rank_promotion"
  | "reward_claimed"
  | "community_join";

export interface AliveActivityItem {
  id: string;
  kind: AliveActivityKind;
  title: string;
  detail: string;
  at: string;
  accent?: "green" | "gold" | "purple" | "blue";
}

export interface SmartWalletInsight {
  id: string;
  kind:
    | "contest_affordance"
    | "add_funds"
    | "expiring_credits"
    | "withdrawable"
    | "reward_near"
    | "mystery_pass";
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  priority: number;
  source: AliveDataSource;
}

export interface AliveRecommendation {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
  priority: number;
  context: string;
}

export interface AliveEmptyStateStep {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
}

export interface AliveEmptyStatePayload {
  title: string;
  body: string;
  steps: AliveEmptyStateStep[];
  context: string;
}

export interface CommunityPresenceData {
  trendingCompetitors: Array<{
    id: string;
    label: string;
    detail: string;
    score?: number;
  }>;
  topWinnersToday: Array<{
    id: string;
    label: string;
    amount: string;
    sport: string;
  }>;
  recentlyJoined: Array<{
    id: string;
    label: string;
    at: string;
  }>;
}

export type AliveCelebrationEvent =
  | "first_deposit"
  | "first_contest"
  | "level_up"
  | "achievement_unlock"
  | "streak_milestone"
  | "wallet_win";

export interface AliveDashboardPayload {
  platformPulse: PlatformPulse;
  personalPulse: PersonalPulse | null;
  activityFeed: AliveActivityItem[];
  walletInsights: SmartWalletInsight[];
  recommendations: AliveRecommendation[];
  communityPresence: CommunityPresenceData;
}
