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

export {
  DEFAULT_PODIUM_CONFIG,
  DEFAULT_PODIUM_ENGINE_CONFIG,
  getPodiumConfig,
  getPodiumEngineConfig,
  resolvePodium,
  awardPodium,
  getPodiumCareerStats,
  podiumMedalForRank,
  PodiumEngine,
  processContestPodium,
  registerPodiumAdapter,
  recordPodiumFinishes,
} from "@/lib/platform/engines/podium";

export { getPlatformPlayerStats } from "@/lib/platform/getPlatformPlayerStats";

export {
  ADMIN_CAPABILITIES,
  ADMIN_RESTRICTIONS,
  ADMIN_PHILOSOPHY,
  STRIPE_FINANCIAL_AUTHORITY,
} from "@/lib/platform/core/adminPolicy";

export {
  PLATFORM_ENTRY_TIERS,
  ENTRY_TIER_GROUPS,
  formatTierCents,
  tierCentsToCostPerSquare,
  normalizeEntryTierCents,
  parseEntryTierParam,
  isValidEntryTierCents,
  type EntryTier,
  type EntryTierGroup,
} from "@/lib/platform/core/entryTiers";

export { TRUST_MESSAGES, TRUST_MESSAGE_LIST } from "@/lib/platform/core/trustMessages";

export {
  SUPPORT_CATEGORIES,
  getSupportCategory,
  type SupportCategoryId,
} from "@/lib/platform/core/supportCategories";

export {
  logPlatformAudit,
  insertPlatformAuditRow,
  listPlatformAuditLog,
  type PlatformAuditEventType,
} from "@/lib/platform/core/auditLog";

export {
  EventEngine,
  publishPlatformEvent,
  subscribeToPlatformEvent,
  registerSportEventDefinition,
  sportPlatformEventType,
} from "@/lib/events";

export {
  creditGrowthFund,
  getGrowthFundStats,
  GROWTH_FUND_PURPOSES,
  GROWTH_FUND_TRANSPARENCY,
} from "@/lib/platform/core/growthFund";

export {
  getFinancialStatusOverview,
  listRecentPayouts,
} from "@/lib/platform/core/financialStatus";

export {
  GUARANTEED_FILL_PERCENT,
  GUARANTEED_PLAY_EXPLAINER,
} from "@/lib/platform/core/guaranteedPlay";

export {
  CONTEST_LANGUAGE,
  getContestLanguage,
  getLoadingMessage,
} from "@/lib/platform/language";
