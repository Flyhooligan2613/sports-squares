export type {
  PodiumPlacement,
  PodiumContestKind,
  PodiumGeoScope,
  PodiumConfig,
  PodiumEngineConfig,
  PodiumCeremonyTemplate,
  PodiumContestKindOverride,
  PodiumPlacementConfig,
  PodiumRewardPackage,
  NearPerfectConfig,
  PodiumStandingInput,
  PodiumStandingsEntry,
  PodiumPlacementResult,
  NearPerfectCandidate,
  PodiumResolution,
  PodiumCashPayout,
  PodiumAwardInput,
  PodiumAwardResult,
  PodiumCareerStats,
  PodiumContestResult,
  PodiumOutcome,
  PodiumCeremony,
  PodiumContestAdapter,
} from "@/lib/platform/engines/podium/types";

export {
  PODIUM_MEDALS,
  podiumMedalForRank,
} from "@/lib/platform/engines/podium/types";

export {
  DEFAULT_PODIUM_CONFIG,
  DEFAULT_PODIUM_ENGINE_CONFIG,
  getPodiumConfig,
  getPodiumEngineConfig,
  podiumRewardSource,
  PODIUM_HUDDLE_TEMPLATES,
} from "@/lib/platform/engines/podium/config";

export {
  calculatePodiumPayouts,
  calculateLegacyWinnerPayouts,
} from "@/lib/platform/engines/podium/calculatePayouts";

export {
  resolvePodium,
  rankStandings,
} from "@/lib/platform/engines/podium/resolvePodium";

export {
  awardPodium,
  awardPodiumWithDefaults,
} from "@/lib/platform/engines/podium/awardPodium";

export {
  recordPodiumFinishes,
  storePodiumFinish,
  getPodiumCareerStats,
} from "@/lib/platform/engines/podium/recordFinishes";

export { buildPodiumCeremony } from "@/lib/platform/engines/podium/ceremony";
export { orchestratePodium } from "@/lib/platform/engines/podium/orchestrator";

export {
  registerPodiumAdapter,
  getPodiumAdapter,
  listPodiumAdapters,
} from "@/lib/platform/engines/podium/registry";

export {
  PodiumEngine,
  processContestPodium,
} from "@/lib/platform/engines/podium/PodiumEngine";

export {
  pickemWeeklyAdapter,
  pickemSeasonAdapter,
} from "@/lib/platform/engines/podium/adapters/pickem";

export {
  tournamentRoyaleAdapter,
  type TournamentRoyalePodiumContext,
} from "@/lib/platform/engines/podium/adapters/tournamentRoyale";

export {
  survivorAdapter,
  type SurvivorPodiumContext,
} from "@/lib/platform/engines/podium/adapters/survivor";

export {
  bracketsAdapter,
  type BracketPodiumContext,
} from "@/lib/platform/engines/podium/adapters/brackets";

/** Backward-compatible pick'em integration helpers. */
export {
  resolvePickemLeaguePodium,
  resolvePickemSeasonPodium,
  type PickemLeaguePodiumResult,
} from "@/lib/platform/engines/podium/integrations/pickem";

export {
  resolveTournamentRoyalePodium,
  type TournamentRoyalePodiumInput,
} from "@/lib/platform/engines/podium/integrations/tournamentRoyale";
