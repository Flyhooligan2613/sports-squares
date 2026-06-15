import type { TimelineEvent, ActionGameCard } from "@/lib/actionCenter/types";
import type { LiveActivityEvent } from "@/lib/liveActivity/types";
import type { PlayerActiveGame, PlayerUpcomingGame } from "@/lib/player/dashboardTypes";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

export type GameDayPhase = "morning" | "afternoon" | "evening" | "night";

export type GameDayAtmosphereTheme =
  | "default"
  | "nfl_sunday"
  | "playoffs"
  | "opening_day"
  | "world_series"
  | "march_madness"
  | "super_bowl"
  | "championship"
  | "holiday";

export interface GameDayAtmosphere {
  theme: GameDayAtmosphereTheme;
  label: string;
  emoji: string;
  tagline: string;
}

export interface GameDayStatusItem {
  id: string;
  emoji: string;
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}

export interface GameDayMission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  rewardLabel: string;
  href: string;
  completed: boolean;
  progress?: { current: number; target: number };
}

export interface GameDayWhatsNextItem {
  id: string;
  emoji: string;
  title: string;
  reason: string;
  href: string;
  priority: number;
}

export interface GameDayEmotionalNotification {
  id: string;
  emoji: string;
  title: string;
  body: string;
  href?: string;
  at: string;
}

export interface GameDayFriendActivity {
  id: string;
  emoji: string;
  name: string;
  action: string;
  at: string;
  href?: string;
}

export interface GameDayCommunityMoment {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  href?: string;
}

export interface GameDayRecap {
  wins: number;
  losses: number;
  rewardsEarnedCents: number;
  xpGained: number;
  tierProgressPct: number;
  tierLabel: string;
  newFollowers: number;
  achievementsUnlocked: number;
  communityActivityCount: number;
  headline: string;
}

export interface GameDayTimelineSection {
  phase: GameDayPhase;
  label: string;
  emoji: string;
  events: TimelineEvent[];
  active: boolean;
}

export interface GameDaySnapshotCard {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  href: string;
  highlight?: boolean;
}

export interface GameDayContinueItem {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  href: string;
  urgent?: boolean;
}

export interface GameDayProgressCenter {
  tierSlug: PlayerTierSlug;
  tierLabel: string;
  tierProgressPct: number;
  creditsToNextTier: number;
  nextTierLabel: string | null;
  lifetimeWins: number;
  lifetimeWinnings: number;
  currentWinStreak: number;
  longestWinStreak: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  achievementNear: string | null;
  weeklyXpEarned: number;
  loginStreakDays: number;
  legacyHeadline: string;
  boardsPlayed: number;
  availableTierCredits: number;
  squareCreditsCents: number;
  pickemCreditsCents: number;
  weeklyMissionsComplete: number;
  weeklyMissionsTotal: number;
}

export interface HomeFriendFollower {
  id: string;
  name: string;
  emoji: string;
  at: string;
  href?: string;
}

export interface HomeFriendsPanel {
  friendsPlayingToday: number;
  communityOnline: number;
  newestFollowers: HomeFriendFollower[];
  friendHighlights: GameDayFriendActivity[];
}

export interface GameDayTodaysGames {
  active: PlayerActiveGame[];
  upcoming: PlayerUpcomingGame[];
}

export interface GameDayHubData {
  updatedAt: string;
  displayName: string;
  avatarEmoji: string;
  greeting: string;
  greetingSubtitle: string;
  phase: GameDayPhase;
  phaseLabel: string;
  atmosphere: GameDayAtmosphere;
  isGameDay: boolean;
  statusItems: GameDayStatusItem[];
  missions: GameDayMission[];
  whatsNext: GameDayWhatsNextItem[];
  notifications: GameDayEmotionalNotification[];
  friendActivity: GameDayFriendActivity[];
  communityMoments: GameDayCommunityMoment[];
  timeline: GameDayTimelineSection[];
  liveActivity: LiveActivityEvent[];
  hotGames: ActionGameCard[];
  recap: GameDayRecap | null;
  tier: {
    slug: PlayerTierSlug;
    label: string;
    progressPct: number;
  };
  snapshotCards: GameDaySnapshotCard[];
  continuePlaying: GameDayContinueItem[];
  todaysGames: GameDayTodaysGames;
  progressCenter: GameDayProgressCenter;
  friendsPlaying: HomeFriendsPanel;
}

/** Directive #011 — authenticated player Home experience */
export type HomeData = GameDayHubData;
