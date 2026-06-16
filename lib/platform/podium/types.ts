/** Universal Podium Reward System™ — shared types for all multi-pick contests. */

export type PodiumPlacement = 1 | 2 | 3;

export type PodiumContestKind =
  | "pickem_weekly"
  | "pickem_season"
  | "tournament_royale"
  | "bracket";

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

export interface PodiumConfig {
  enabled: boolean;
  cashSplit: PodiumCashSplit;
  thirdPlacePackage: PodiumRewardPackage;
  firstPlaceBonus: PodiumRewardPackage;
  secondPlaceBonus: PodiumRewardPackage;
  nearPerfect: NearPerfectConfig;
  /** When false, legacy single-winner 100% cash flow is preserved. */
  usePodiumCashSplit: boolean;
}

export interface PodiumStandingInput {
  email: string;
  rank: number;
  score: number;
  metadata?: Record<string, unknown>;
}

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
