import type { PlayerLegacyStats } from "@/lib/player/legacyTypes";
import type { RewardRarity } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

export type AchievementCategory =
  | "squares"
  | "wins"
  | "streaks"
  | "earnings"
  | "referrals"
  | "drops"
  | "pickem"
  | "seasons"
  | "community"
  | "legend";

export interface EcosystemAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: RewardRarity;
  unlocked: boolean;
  progress?: { current: number; target: number };
}

export interface AchievementContext {
  legacy: PlayerLegacyStats;
  mysteryBoxesOpened: number;
  qualifiedReferrals: number;
  loginStreakDays: number;
  lifetimeTierCredits: number;
  pickemWins?: number;
  pickemPerfectWeeks?: number;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: RewardRarity;
  check: (ctx: AchievementContext) => boolean;
  progress?: (ctx: AchievementContext) => { current: number; target: number } | undefined;
}

function milestone(
  prefix: string,
  label: string,
  emoji: string,
  category: AchievementCategory,
  rarity: RewardRarity,
  values: number[],
  getValue: (ctx: AchievementContext) => number,
  unit: string,
  dollarPrefix = false
): AchievementDef[] {
  return values.map((target) => ({
    id: `${prefix}_${target}`,
    title: dollarPrefix ? `$${target.toLocaleString()} Club` : label.replace("{n}", target.toLocaleString()),
    description: `Reach ${dollarPrefix ? `$${target.toLocaleString()}` : target.toLocaleString()} ${unit}`,
    emoji,
    category,
    rarity,
    check: (ctx) => getValue(ctx) >= target,
    progress: (ctx) => ({ current: Math.min(getValue(ctx), target), target }),
  }));
}

const NAMED: AchievementDef[] = [
  {
    id: "first_square",
    title: "First Square",
    description: "Purchased your very first square",
    emoji: "🎲",
    category: "squares",
    rarity: "common",
    check: (c) => c.legacy.totalSquaresPurchased >= 1,
  },
  {
    id: "lucky_winner",
    title: "Lucky Winner",
    description: "Won a quarter on your first board",
    emoji: "🍀",
    category: "wins",
    rarity: "rare",
    check: (c) => c.legacy.lifetimeWins >= 1 && c.legacy.boardsPlayed <= 3,
  },
  {
    id: "quarter_king",
    title: "Quarter King",
    description: "50+ lifetime quarter wins",
    emoji: "👑",
    category: "wins",
    rarity: "legendary",
    check: (c) => c.legacy.lifetimeWins >= 50,
  },
  {
    id: "overtime_survivor",
    title: "Overtime Survivor",
    description: "Won during a live overtime finish",
    emoji: "⏱️",
    category: "wins",
    rarity: "epic",
    check: (c) => c.legacy.lifetimeWins >= 5,
  },
  {
    id: "referral_master",
    title: "Referral Master",
    description: "25+ qualified referrals",
    emoji: "🤝",
    category: "referrals",
    rarity: "legendary",
    check: (c) => c.qualifiedReferrals >= 25,
  },
  {
    id: "community_builder",
    title: "Community Builder",
    description: "10+ qualified referrals",
    emoji: "🏗️",
    category: "referrals",
    rarity: "epic",
    check: (c) => c.qualifiedReferrals >= 10,
  },
  {
    id: "legend_status",
    title: "Legend Status",
    description: "10,000+ lifetime tier credits earned",
    emoji: "🔥",
    category: "legend",
    rarity: "mythic",
    check: (c) => c.lifetimeTierCredits >= 10000,
  },
  {
    id: "million_dollar_club",
    title: "Million Dollar Club",
    description: "$1,000+ lifetime winnings",
    emoji: "💰",
    category: "earnings",
    rarity: "mythic",
    check: (c) => c.legacy.lifetimeWinnings >= 1000,
  },
  {
    id: "founding_member",
    title: "Founding Member",
    description: "Played across 3+ seasons",
    emoji: "🛡️",
    category: "seasons",
    rarity: "legendary",
    check: (c) => c.legacy.seasonsPlayed >= 3,
  },
  {
    id: "first_drop",
    title: "Drop Initiate",
    description: "Opened your first Square Drop",
    emoji: "🎁",
    category: "drops",
    rarity: "common",
    check: (c) => c.mysteryBoxesOpened >= 1,
  },
  {
    id: "drop_addict",
    title: "Drop Devotee",
    description: "Opened 52 Square Drops — a full year",
    emoji: "📦",
    category: "drops",
    rarity: "immortal",
    check: (c) => c.mysteryBoxesOpened >= 52,
  },
  {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Perfect Pick'em week",
    emoji: "🎯",
    category: "pickem",
    rarity: "legendary",
    check: (c) => (c.pickemPerfectWeeks ?? 0) >= 1,
  },
  {
    id: "first_pickem_victory",
    title: "First Pick'em Victory",
    description: "Won your first Pick'em contest",
    emoji: "🏈",
    category: "pickem",
    rarity: "common",
    check: (c) => (c.pickemWins ?? 0) >= 1,
  },
  {
    id: "longest_streak_17",
    title: "17-Week Streak",
    description: "Maintained a 17-week login streak",
    emoji: "📅",
    category: "streaks",
    rarity: "immortal",
    check: (c) => c.loginStreakDays >= 17 * 7,
  },
];

const DEFINITIONS: AchievementDef[] = [
  ...NAMED,
  ...milestone("boards", "{n} Boards", "📋", "squares", "common", [1, 5, 10, 25, 50, 100, 250, 500, 1000], (c) => c.legacy.boardsPlayed, "boards played"),
  ...milestone("squares", "{n} Squares", "🎯", "squares", "common", [1, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000], (c) => c.legacy.totalSquaresPurchased, "squares purchased"),
  ...milestone("wins", "{n} Wins", "🏆", "wins", "rare", [1, 3, 5, 10, 25, 50, 100, 250, 500], (c) => c.legacy.lifetimeWins, "quarter wins"),
  ...milestone("streak", "{n} Win Streak", "⚡", "streaks", "epic", [3, 5, 7, 10, 15], (c) => c.legacy.longestWinStreak, "win streak"),
  ...milestone("earnings", "${n} Club", "💵", "earnings", "epic", [10, 25, 50, 100, 250, 500, 1000, 2500, 5000], (c) => Math.floor(c.legacy.lifetimeWinnings), "lifetime winnings", true),
  ...milestone("referrals", "{n} Referrals", "👥", "referrals", "rare", [1, 3, 5, 10, 25, 50, 100, 250, 500], (c) => c.qualifiedReferrals, "qualified referrals"),
  ...milestone("drops", "{n} Drops", "🎁", "drops", "rare", [1, 5, 10, 25, 52, 100], (c) => c.mysteryBoxesOpened, "Square Drops opened"),
  ...milestone("seasons", "{n} Seasons", "📆", "seasons", "rare", [1, 2, 3, 5, 10], (c) => c.legacy.seasonsPlayed, "seasons played"),
  ...milestone("credits", "{n} Credits", "⭐", "legend", "epic", [100, 500, 1000, 2500, 5000, 10000, 25000], (c) => c.lifetimeTierCredits, "lifetime tier credits"),
  ...milestone("login", "{n} Day Login", "🔥", "streaks", "rare", [3, 7, 14, 30, 60, 100, 365], (c) => c.loginStreakDays, "day login streak"),
  ...milestone("pickem_wins", "{n} Pick'em Wins", "🏈", "pickem", "rare", [1, 5, 10, 25, 50, 100], (c) => c.pickemWins ?? 0, "Pick'em wins"),
  ...milestone("active_streak", "{n} Active Streak", "⚡", "streaks", "epic", [2, 3, 5, 7, 10], (c) => c.legacy.currentWinStreak, "active win streak"),
  ...milestone("years", "{n} Years", "🎖️", "seasons", "legendary", [1, 2, 3, 5], (c) => c.legacy.yearsPlayed, "years on SquareBoards"),
];

export const ACHIEVEMENT_CATALOG_SIZE = DEFINITIONS.length;

export function evaluateAchievements(ctx: AchievementContext): EcosystemAchievement[] {
  return DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    category: def.category,
    rarity: def.rarity,
    unlocked: def.check(ctx),
    progress: def.progress?.(ctx),
  }));
}

export function achievementStats(achievements: EcosystemAchievement[]) {
  const unlocked = achievements.filter((a) => a.unlocked);
  return {
    total: achievements.length,
    unlocked: unlocked.length,
    pct: Math.round((unlocked.length / achievements.length) * 100),
  };
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  squares: "Squares",
  wins: "Wins",
  streaks: "Streaks",
  earnings: "Earnings",
  referrals: "Referrals",
  drops: "Square Drop",
  pickem: "Pick'em",
  seasons: "Seasons",
  community: "Community",
  legend: "Legend",
};
