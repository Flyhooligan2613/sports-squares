import type { PodiumResolution } from "@/lib/platform/podium/types";
import {
  awardPodiumWithDefaults,
  getPodiumConfig,
  rankStandings,
  resolvePodium,
} from "@/lib/platform/podium";

export interface TournamentRoyalePodiumInput {
  tournamentId: string;
  tournamentLabel: string;
  seasonYear: number;
  prizePoolCents: number;
  standings: Array<{ email: string; score: number }>;
}

/**
 * Tournament Royale podium interface — wire when final standings exist.
 * Scaffold: resolves placements and awards platform rewards; cash when pool > 0.
 */
export async function resolveTournamentRoyalePodium(
  input: TournamentRoyalePodiumInput
): Promise<PodiumResolution | null> {
  const config = await getPodiumConfig();
  if (!config.enabled || input.standings.length < 2) return null;

  const ranked = rankStandings(input.standings);
  const resolution = resolvePodium({
    standings: ranked,
    nearPerfectConfig: config.nearPerfect,
  });

  await awardPodiumWithDefaults({
    contestKind: "tournament_royale",
    contestId: input.tournamentId,
    sport: "tournament_royale",
    seasonYear: input.seasonYear,
    prizePoolCents: input.prizePoolCents,
    resolution,
    label: input.tournamentLabel,
  });

  return resolution;
}
