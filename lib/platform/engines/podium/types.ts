/** PodiumEngine™ — Core Platform Engine types for ranked competition finishes. */

export type PodiumPlacement = 1 | 2 | 3;

export type PodiumContestKind =
  | "pickem_weekly"
  | "pickem_season"
  | "tournament_royale"
  | "survivor"
  | "bracket";

export type PodiumGeoScope = "global" | "national" | "regional" | "league";

export interface PodiumRewardPackage {
  tierCredits: number;
  xpBonus?: number;
  competitorScoreBonus?: number;
  inventoryBadge?: string;
  achievementId?: string;
}

export interface NearPerfectConfig {
  enabled: boolean;
  /** Max rank gap from 3rd place to qualify (e.g. 1 = 4th place only). */
  maxRankGap: number;
  /** Min score gap from 3rd place (pick'em: wins behind 3rd). */
  maxScoreGap: number;
  tierCredits: number;
  competitorScoreBonus: number;
}

export interface PodiumCashSplit {
  firstPct: number;
  secondPct: number;
  thirdPct: number;
}

/** Future top-N placement config — scaffold for top 5/10 championships. */
export interface PodiumPlacementConfig {
  topN: number;
  enabledPlacements: number[];
  cashSplit?: PodiumCashSplit;
}

export interface PodiumConfig {
  enabled: boolean;
  cashSplit: PodiumCashSplit;
  thirdPlacePackage: PodiumRewardPackage;
  firstPlaceBonus: PodiumRewardPackage;
  secondPlaceBonus: PodiumRewardPackage;
  nearPerfect: NearPerfectConfig;
  /** When false, legacy single-winner 100% cash flow is preserved. */
  usePodiumCashSplit: boolean;
  placement?: PodiumPlacementConfig;
}

export interface PodiumCeremonyTemplate {
  headline: string;
  first: string;
  second: string;
  third: string;
  nearPerfect: string;
}

export interface PodiumContestKindOverride extends Partial<PodiumConfig> {
  geoScope?: PodiumGeoScope;
}

/** Full PodiumEngine™ ecosystem config schema. */
export interface PodiumEngineConfig {
  enabled: boolean;
  defaultConfig: PodiumConfig;
  topN: {
    enabled: boolean;
    maxPlacements: number;
  };
  ceremonyTemplates: PodiumCeremonyTemplate;
  contestKindOverrides: Partial<Record<PodiumContestKind, PodiumContestKindOverride>>;
  geoChampionships: {
    enabled: boolean;
    scopes: PodiumGeoScope[];
  };
  seasonal: {
    enabled: boolean;
  };
  sponsoredEvents: {
    enabled: boolean;
  };
}

export interface PodiumStandingInput {
  email: string;
  rank: number;
  score: number;
  metadata?: Record<string, unknown>;
}

/** Alias for adapter-facing standings rows. */
export type PodiumStandingsEntry = PodiumStandingInput;

export interface PodiumPlacementResult {
  placement: PodiumPlacement;
  email: string;
  rank: number;
  score: number;
  splitCount: number;
  metadata?: Record<string, unknown>;
}

export interface NearPerfectCandidate {
  email: string;
  rank: number;
  score: number;
  gapFromThird: number;
}

export interface PodiumResolution {
  placements: PodiumPlacementResult[];
  nearPerfect: NearPerfectCandidate[];
  topTen: PodiumStandingInput[];
}

export interface PodiumCashPayout {
  email: string;
  placement: PodiumPlacement;
  amountCents: number;
  splitCount: number;
}

export interface PodiumAwardInput {
  contestKind: PodiumContestKind;
  contestId: string;
  leagueId?: string | null;
  sport?: string;
  seasonYear?: number;
  prizePoolCents: number;
  resolution: PodiumResolution;
  config: PodiumConfig;
  label: string;
}

export interface PodiumAwardResult {
  payouts: PodiumCashPayout[];
  recordsStored: number;
  eventsPublished: number;
  errors: string[];
}

export interface PodiumCareerStats {
  championships: number;
  runnerUp: number;
  thirdPlace: number;
  topTen: number;
  nearPerfect: number;
}

/** Input to PodiumEngine.process — contest-agnostic result envelope. */
export interface PodiumContestResult {
  kind: PodiumContestKind;
  contestId: string;
  leagueId?: string | null;
  sport?: string;
  seasonYear?: number;
  label: string;
  /** Emails occupying 1st after tiebreaker — overrides score grouping for place 1. */
  firstPlaceEmails?: string[];
  /** Contest-specific context passed to adapter hooks. */
  context?: Record<string, unknown>;
}

/** Full pipeline output from PodiumEngine™. */
export interface PodiumOutcome {
  resolution: PodiumResolution;
  award: PodiumAwardResult;
  ceremony: PodiumCeremony | null;
  podiumEnabled: boolean;
  errors: string[];
}

/** Podium Ceremony™ — config-driven celebration copy and metadata. */
export interface PodiumCeremony {
  templateKey: string;
  headline: string;
  summary: string;
  placements: PodiumPlacementResult[];
  nearPerfect: NearPerfectCandidate[];
  contestKind: PodiumContestKind;
  contestId: string;
  label: string;
  metadata: Record<string, unknown>;
}

/** Contest adapter — supplies standings, pool, and optional post-award hooks only. */
export interface PodiumContestAdapter {
  kind: PodiumContestKind;
  resolveStandings(input: PodiumContestResult): Promise<PodiumStandingsEntry[]>;
  getPrizePool(input: PodiumContestResult): Promise<number>;
  getConfig?(): Promise<PodiumConfig>;
  onAwarded?(input: {
    contestResult: PodiumContestResult;
    resolution: PodiumResolution;
    award: PodiumAwardResult;
  }): Promise<void>;
}

export const PODIUM_MEDALS: Record<PodiumPlacement, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function podiumMedalForRank(rank: number): string | null {
  if (rank === 1) return PODIUM_MEDALS[1];
  if (rank === 2) return PODIUM_MEDALS[2];
  if (rank === 3) return PODIUM_MEDALS[3];
  return null;
}
