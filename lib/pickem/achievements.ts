import type { PickemAchievement, PickemPlayerStats, PickemSport } from "@/lib/pickem/types";

export const PICKEM_ACHIEVEMENTS: Omit<PickemAchievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "first-win",
    title: "First Win",
    description: "Correctly picked your first winning team.",
    emoji: "🎯",
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Went undefeated in a full weekly slate.",
    emoji: "💎",
  },
  {
    id: "ten-week-streak",
    title: "10 Week Streak",
    description: "Ten consecutive correct picks.",
    emoji: "🔥",
  },
  {
    id: "hundred-correct",
    title: "100 Correct Picks",
    description: "Reached 100 lifetime correct picks.",
    emoji: "💯",
  },
  {
    id: "top-100",
    title: "Top 100 Worldwide",
    description: "Ranked in the global top 100.",
    emoji: "🌍",
  },
  {
    id: "season-champion",
    title: "Season Champion",
    description: "Won a season-long Pick'em championship.",
    emoji: "👑",
  },
  {
    id: "founding-member",
    title: "Founding Member",
    description: "Played in the inaugural Pick'em season.",
    emoji: "⭐",
  },
];

export function computePickemAchievements(
  stats: PickemPlayerStats,
  options?: { worldwideRank?: number | null; foundingSeasonYear?: number }
): PickemAchievement[] {
  const foundingYear = options?.foundingSeasonYear ?? 2025;

  return PICKEM_ACHIEVEMENTS.map((def) => {
    let unlocked = false;

    switch (def.id) {
      case "first-win":
        unlocked = stats.correctPicks >= 1;
        break;
      case "perfect-week":
        unlocked = stats.perfectWeeks >= 1;
        break;
      case "ten-week-streak":
        unlocked = stats.longestStreak >= 10;
        break;
      case "hundred-correct":
        unlocked = stats.correctPicks >= 100;
        break;
      case "top-100":
        unlocked =
          options?.worldwideRank != null &&
          options.worldwideRank > 0 &&
          options.worldwideRank <= 100;
        break;
      case "season-champion":
        unlocked = stats.seasonChampionships >= 1;
        break;
      case "founding-member":
        unlocked = stats.seasonYear <= foundingYear && stats.weeksPlayed >= 1;
        break;
      default:
        break;
    }

    return { ...def, unlocked, unlockedAt: unlocked ? new Date().toISOString() : null };
  });
}

export function pickAccuracyPct(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

export function emptyPickemPlayerStats(
  email: string,
  sport: PickemSport,
  seasonYear: number
): PickemPlayerStats {
  return {
    email,
    sport,
    seasonYear,
    weeklyWins: 0,
    weeklyLosses: 0,
    weeklyPending: 0,
    seasonWins: 0,
    seasonLosses: 0,
    lifetimeWins: 0,
    lifetimeLosses: 0,
    currentStreak: 0,
    longestStreak: 0,
    perfectWeekStreak: 0,
    weeklyWinStreak: 0,
    weeksPlayed: 0,
    perfectWeeks: 0,
    seasonChampionships: 0,
    totalPicks: 0,
    correctPicks: 0,
    pickAccuracyPct: 0,
    mondayTiebreakerWins: 0,
    lifetimeEarningsCents: 0,
    bestFinish: null,
    lifetimePickemWins: 0,
    bestWeeklyRecord: null,
    achievements: [],
  };
}
