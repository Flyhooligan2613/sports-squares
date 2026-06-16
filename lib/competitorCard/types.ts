import type { PlayerAchievement, PlayerLegacyStats } from "@/lib/player/legacyTypes";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export type CompetitorCardMode = "own" | "public";

export type CompetitorScoreRankTitle =
  | "Rising Competitor"
  | "Contender"
  | "Veteran Competitor"
  | "Elite Competitor"
  | "Champion Competitor"
  | "Legendary Competitor";

export interface CompetitorScoreBreakdown {
  participation: number;
  wins: number;
  achievements: number;
  streaks: number;
  tier: number;
  community: number;
  referrals: number;
  podium: number;
}

export interface CompetitorScorePercentiles {
  world: number | null;
  state: number | null;
  city: number | null;
  friends: number | null;
}

export interface CompetitorScore {
  total: number;
  rankTitle: CompetitorScoreRankTitle;
  breakdown: CompetitorScoreBreakdown;
  percentiles: CompetitorScorePercentiles;
}

export interface CompetitorIdentity {
  displayName: string;
  slug: string;
  playerId: string | null;
  avatarEmoji: string;
  bio: string | null;
  memberSince: string;
  headline: string;
  isVerified: boolean;
  favoriteTeam: string | null;
  tierSlug: PlayerTierSlug;
  tierName: string;
  tierLevel: number;
}

export interface HeroStat {
  id: string;
  label: string;
  value: number;
  format: "number" | "currency" | "percent";
  accent?: string;
}

export interface TierProgress {
  slug: PlayerTierSlug;
  name: string;
  level: number;
  progressPct: number;
  creditsToNext: number;
  nextTierName: string | null;
  lifetimeCredits: number;
}

export interface ReputationPanelData {
  titles: string[];
  communityReputation: number;
  creatorLevel: string | null;
  followerCount: number;
}

export interface CareerShowcaseItem {
  id: string;
  type: "win" | "achievement" | "streak" | "tier";
  title: string;
  subtitle: string;
  emoji: string;
  at?: string;
}

export interface TrophyItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

export interface LegacyTimelineEvent {
  id: string;
  type: "win" | "achievement" | "tier" | "milestone";
  title: string;
  subtitle: string;
  at: string;
  emoji: string;
}

export interface SeasonDashboardData {
  weeklyCredits: number;
  weeklyGameplayCents: number;
  currentStreak: number;
  longestStreak: number;
  boardsThisSeason: number;
  winsThisSeason: number | null;
}

export interface CareerRecord {
  id: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export interface RivalryItem {
  id: string;
  opponentSlug: string;
  opponentName: string;
  opponentAvatar: string;
  wins: number;
  losses: number;
  lastContestAt: string | null;
}

export interface CommunityPanelData {
  followerCount: number;
  followingCount: number;
  viewerIsFollowing: boolean;
  featuredFollowers: {
    slug: string;
    displayName: string;
    avatarEmoji: string;
    tierName: string;
  }[];
}

export interface CustomizationState {
  profileFrameId: string | null;
  featuredAchievementIds: string[];
  favoriteTeam: string | null;
  bio: string | null;
}

export interface CompetitorCardQuickActions {
  canFollow: boolean;
  canShare: boolean;
  canChallenge: boolean;
  canReport: boolean;
}

export type CompetitorCardSection =
  | "full"
  | "stats"
  | "legacy"
  | "trophies"
  | "rivalries"
  | "achievements";

export interface CompetitorCardData {
  mode: CompetitorCardMode;
  slug: string;
  isOwner: boolean;
  sharePath: string;
  identity: CompetitorIdentity;
  score: CompetitorScore;
  heroStats: HeroStat[];
  tier: TierProgress;
  reputation: ReputationPanelData;
  careerShowcase: CareerShowcaseItem[];
  trophies: TrophyItem[];
  legacyTimeline: LegacyTimelineEvent[];
  season: SeasonDashboardData;
  careerRecords: CareerRecord[];
  rivalries: RivalryItem[];
  community: CommunityPanelData;
  achievements: PlayerAchievement[];
  stats: PlayerLegacyStats;
  customization: CustomizationState;
  quickActions: CompetitorCardQuickActions;
}

export type CompetitorCardSectionPayload = Pick<
  CompetitorCardData,
  | "heroStats"
  | "stats"
  | "score"
  | "legacyTimeline"
  | "trophies"
  | "rivalries"
  | "achievements"
>;
