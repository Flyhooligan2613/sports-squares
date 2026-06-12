import type { PlatformGameId } from "@/lib/platform/gameTypes";
import type { GameTypeStats, PlatformPlayerStats } from "@/lib/platform/playerStatsTypes";
import {
  aggregatePlatformTotals,
  emptyGameTypeStats,
} from "@/lib/platform/playerStatsTypes";
import type { PlayerLegacyStats } from "@/lib/player/legacyTypes";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";

/** Map legacy SquareBoards aggregates into the platform game-stats shape. */
export function legacyStatsToSquareBoardsGameStats(
  legacy: PlayerLegacyStats
): GameTypeStats {
  return {
    gameType: "squareboards",
    wins: legacy.lifetimeWins,
    winningsCents: Math.round(legacy.lifetimeWinnings * 100),
    gamesPlayed: legacy.boardsPlayed,
    currentStreak: legacy.currentWinStreak,
    longestStreak: legacy.longestWinStreak,
    extra: {
      squaresWon: legacy.squaresWon,
      totalSquaresPurchased: legacy.totalSquaresPurchased,
      seasonsPlayed: legacy.seasonsPlayed,
      yearsPlayed: legacy.yearsPlayed,
    },
  };
}

export function buildPlatformPlayerStats(input: {
  email: string;
  memberSince?: string | null;
  favoriteTeam?: string | null;
  legacyStats?: PlayerLegacyStats | null;
  storedByGame?: Partial<Record<PlatformGameId, GameTypeStats>>;
  achievements?: PlayerAchievement[];
}): PlatformPlayerStats {
  const byGame: Partial<Record<PlatformGameId, GameTypeStats>> = {
    ...input.storedByGame,
  };

  if (input.legacyStats) {
    byGame.squareboards = legacyStatsToSquareBoardsGameStats(input.legacyStats);
  } else if (!byGame.squareboards) {
    byGame.squareboards = emptyGameTypeStats("squareboards");
  }

  const totals = aggregatePlatformTotals(byGame);

  return {
    email: input.email,
    memberSince: input.memberSince ?? null,
    favoriteTeam: input.favoriteTeam ?? null,
    achievements: input.achievements ?? [],
    byGame,
    ...totals,
  };
}
