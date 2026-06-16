export type {
  PodiumPlacement,
  PodiumContestKind,
  PodiumConfig,
  PodiumRewardPackage,
  NearPerfectConfig,
  PodiumStandingInput,
  PodiumPlacementResult,
  NearPerfectCandidate,
  PodiumResolution,
  PodiumCashPayout,
  PodiumAwardInput,
  PodiumAwardResult,
  PodiumCareerStats,
} from "@/lib/platform/podium/types";

export {
  PODIUM_MEDALS,
  podiumMedalForRank,
} from "@/lib/platform/podium/types";

export {
  DEFAULT_PODIUM_CONFIG,
  getPodiumConfig,
  podiumRewardSource,
  PODIUM_HUDDLE_TEMPLATES,
} from "@/lib/platform/podium/config";

export {
  calculatePodiumPayouts,
  calculateLegacyWinnerPayouts,
} from "@/lib/platform/podium/calculatePayouts";

export {
  resolvePodium,
  rankStandings,
} from "@/lib/platform/podium/resolvePodium";

export {
  awardPodium,
  awardPodiumWithDefaults,
  storePodiumFinish,
  getPodiumCareerStats,
} from "@/lib/platform/podium/awardPodium";

export {
  resolvePickemLeaguePodium,
  resolvePickemSeasonPodium,
} from "@/lib/platform/podium/integrations/pickem";

export {
  resolveTournamentRoyalePodium,
  type TournamentRoyalePodiumInput,
} from "@/lib/platform/podium/integrations/tournamentRoyale";
