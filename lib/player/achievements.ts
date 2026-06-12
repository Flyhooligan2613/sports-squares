import type { PlayerAchievement, PlayerLegacyStats } from "@/lib/player/legacyTypes";

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: (stats: PlayerLegacyStats) => boolean;
}

const DEFINITIONS: AchievementDef[] = [
  {
    id: "first_board",
    title: "In the Game",
    description: "Purchased your first squares",
    emoji: "🎲",
    unlocked: (s) => s.boardsPlayed >= 1,
  },
  {
    id: "first_win",
    title: "First Win",
    description: "Won your first quarter",
    emoji: "🏆",
    unlocked: (s) => s.lifetimeWins >= 1,
  },
  {
    id: "ten_wins",
    title: "Quarter Collector",
    description: "10 lifetime quarter wins",
    emoji: "🔥",
    unlocked: (s) => s.lifetimeWins >= 10,
  },
  {
    id: "hot_streak",
    title: "On a Roll",
    description: "3+ win streak active",
    emoji: "⚡",
    unlocked: (s) => s.currentWinStreak >= 3,
  },
  {
    id: "streak_legend",
    title: "Streak Legend",
    description: "Longest streak of 5+ wins",
    emoji: "👑",
    unlocked: (s) => s.longestWinStreak >= 5,
  },
  {
    id: "big_winner",
    title: "Big Winner",
    description: "$100+ lifetime winnings",
    emoji: "💰",
    unlocked: (s) => s.lifetimeWinnings >= 100,
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Played across 2+ seasons",
    emoji: "🛡️",
    unlocked: (s) => s.seasonsPlayed >= 2,
  },
  {
    id: "squares_champion",
    title: "Squares Champion",
    description: "25+ squares purchased",
    emoji: "🎯",
    unlocked: (s) => s.totalSquaresPurchased >= 25,
  },
];

export function buildAchievements(stats: PlayerLegacyStats): PlayerAchievement[] {
  return DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    unlocked: def.unlocked(stats),
  }));
}

export function legacyHeadline(stats: PlayerLegacyStats): string {
  if (stats.currentWinStreak >= 3) {
    return `${stats.currentWinStreak}-win streak — keep it alive.`;
  }
  if (stats.lifetimeWins >= 10) {
    return `${stats.lifetimeWins} quarter wins and counting.`;
  }
  if (stats.lifetimeWins >= 1) {
    return "Building your SquareBoards legacy.";
  }
  if (stats.boardsPlayed >= 1) {
    return "Your boards are waiting — good luck tonight.";
  }
  return "Every champion starts with one board.";
}
