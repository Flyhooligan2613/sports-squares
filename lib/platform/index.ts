export {
  PLATFORM_GAMES,
  getPlatformGame,
  isPlatformGameAvailable,
  isPlatformGameNavActive,
  isSquareBoardsRoute,
  type PlatformGameDefinition,
  type PlatformGameId,
  type PlatformGameStatus,
} from "@/lib/platform/gameTypes";

export {
  PLATFORM_STAT_FIELDS,
  aggregatePlatformTotals,
  emptyGameTypeStats,
  type GameTypeStats,
  type PlatformPlayerStats,
} from "@/lib/platform/playerStatsTypes";

export {
  buildPlatformPlayerStats,
  legacyStatsToSquareBoardsGameStats,
} from "@/lib/platform/statsAdapter";

export { getPlatformPlayerStats } from "@/lib/platform/getPlatformPlayerStats";
