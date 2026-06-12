import type { PlatformGameId } from "@/lib/platform/gameTypes";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";

/** Per-game stats — stored in `player_game_stats` and aggregated for profiles. */
export interface GameTypeStats {
  gameType: PlatformGameId;
  wins: number;
  winningsCents: number;
  gamesPlayed: number;
  currentStreak: number;
  longestStreak: number;
  /** Game-specific counters (e.g. squaresWon, pickemWins) */
  extra: Record<string, number>;
}

/**
 * Cross-game player profile stats — shared account layer for all platform games.
 * UI can adopt incrementally; data model is ready for expansion.
 */
export interface PlatformPlayerStats {
  email: string;
  memberSince: string | null;
  favoriteTeam: string | null;
  lifetimeWinningsCents: number;
  currentStreak: number;
  longestStreak: number;
  achievements: PlayerAchievement[];
  byGame: Partial<Record<PlatformGameId, GameTypeStats>>;
}

/** Canonical stat field names referenced across games and profile UI. */
export const PLATFORM_STAT_FIELDS = {
  squaresWon: "squaresWon",
  pickemWins: "pickemWins",
  currentStreak: "currentStreak",
  longestStreak: "longestStreak",
  lifetimeWinnings: "lifetimeWinnings",
  memberSince: "memberSince",
  favoriteTeam: "favoriteTeam",
  achievements: "achievements",
} as const;

export function emptyGameTypeStats(gameType: PlatformGameId): GameTypeStats {
  return {
    gameType,
    wins: 0,
    winningsCents: 0,
    gamesPlayed: 0,
    currentStreak: 0,
    longestStreak: 0,
    extra: {},
  };
}

export function aggregatePlatformTotals(
  byGame: Partial<Record<PlatformGameId, GameTypeStats>>
): Pick<
  PlatformPlayerStats,
  "lifetimeWinningsCents" | "currentStreak" | "longestStreak"
> {
  let lifetimeWinningsCents = 0;
  let currentStreak = 0;
  let longestStreak = 0;

  for (const stats of Object.values(byGame)) {
    if (!stats) continue;
    lifetimeWinningsCents += stats.winningsCents;
    currentStreak = Math.max(currentStreak, stats.currentStreak);
    longestStreak = Math.max(longestStreak, stats.longestStreak);
  }

  return { lifetimeWinningsCents, currentStreak, longestStreak };
}
