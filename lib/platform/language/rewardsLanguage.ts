/**
 * Rewards & progression copy — Phase 3D (PROJECT BLACK LABEL).
 * Premium achievement language; no casino/gambling VIP tone.
 */

import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

/** Display ladder mapped onto ecosystem tier slugs (Bronze → Elite + legacy peaks). */
export const TIER_DISPLAY_NAMES: Record<PlayerTierSlug, string> = {
  rookie: "Bronze",
  contender: "Silver",
  "all-star": "Gold",
  champion: "Platinum",
  elite: "Diamond",
  legend: "Elite",
  "hall-of-fame": "Hall of Fame",
  immortal: "Immortal",
};

export const REWARDS_SECTIONS = {
  currentTier: "Current Tier",
  rewardPoints: "Reward Points",
  tierCredits: "Tier Credits",
  weeklyProgress: "Weekly Progress",
  monthlyProgress: "Monthly Progress",
  seasonProgress: "Season Progress",
  lifetimeProgress: "Lifetime Progress",
  lifetimeAchievements: "Lifetime Achievements",
  availableRewards: "Available Rewards",
  lockedRewards: "Locked Rewards",
  upcomingMilestones: "Upcoming Milestones",
  rewardHistory: "Reward History",
  streaks: "Activity Streaks",
} as const;

export const REWARDS_EMPTY = {
  noRewardsTitle: "Your rewards journey starts here",
  noRewardsBody:
    "Join your first contest to begin earning achievements and unlocking new rewards.",
  noHistoryTitle: "No reward activity yet",
  noHistoryBody:
    "Compete in contests and open your Weekly Reward Drop to start building your timeline.",
  noAchievementsTitle: "Achievements await",
  noAchievementsBody:
    "Join your first contest to begin earning achievements and unlocking new rewards.",
  noInventoryTitle: "Your trophy case is empty",
  noInventoryBody:
    "Earn badges, cosmetics, and bonus items as you compete across the platform.",
} as const;

export const STREAK_COPY = {
  dailyLogin: (days: number) =>
    days <= 1
      ? "Start a daily login streak — check in tomorrow to keep it going."
      : `You're on a ${days}-day login streak`,
  weeklyParticipation: (active: boolean) =>
    active
      ? "You've competed this week — keep your weekly participation streak alive."
      : "Join a contest this week to start a participation streak.",
  monthlyActivity: (days: number) =>
    days >= 7
      ? `You're on a ${days}-day activity streak — consistency builds legacy.`
      : "Stay active this month to grow your activity streak.",
} as const;

export const PROGRESS_GOALS = {
  weeklyCredits: 100,
  monthlyCredits: 400,
  seasonCredits: 1500,
} as const;

/** Featured achievement cards for Rewards Home — wired to ecosystem catalog IDs. */
export const FEATURED_ACHIEVEMENTS = [
  {
    id: "boards_1",
    title: "First Contest",
    description: "Joined your first competitive board",
    emoji: "🏟️",
    rewardLabel: "25 Tier Credits",
  },
  {
    id: "wins_1",
    title: "First Win",
    description: "Won your first quarter on the board",
    emoji: "🏆",
    rewardLabel: "50 Tier Credits",
  },
  {
    id: "boards_10",
    title: "10 Contests",
    description: "Competed across 10 boards",
    emoji: "📋",
    rewardLabel: "Profile badge",
  },
  {
    id: "squares_100",
    title: "100 Squares",
    description: "Purchased 100 squares across your career",
    emoji: "🎯",
    rewardLabel: "100 Tier Credits",
  },
  {
    id: "login_30",
    title: "30-Day Active",
    description: "Maintained a 30-day login streak",
    emoji: "🔥",
    rewardLabel: "Streak frame",
  },
  {
    id: "community_builder",
    title: "Community Contributor",
    description: "Invited 10 qualified competitors",
    emoji: "🤝",
    rewardLabel: "Referral badge",
  },
  {
    id: "genesis_official_competitor",
    title: "Verified Competitor",
    description: "Official roster member — welcome to the arena",
    emoji: "🎖️",
    rewardLabel: "Competitor badge",
  },
] as const;

export function getTierDisplayName(slug: PlayerTierSlug): string {
  return TIER_DISPLAY_NAMES[slug] ?? slug;
}
