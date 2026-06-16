import type { PodiumResolution } from "@/lib/platform/engines/podium/types";
import { processContestPodium } from "@/lib/platform/engines/podium/PodiumEngine";

export interface TournamentRoyalePodiumInput {
  tournamentId: string;
  tournamentLabel: string;
  seasonYear: number;
  prizePoolCents: number;
  standings: Array<{ email: string; score: number }>;
}

/**
 * Tournament Royale podium interface — wire when final standings exist.
 * Delegates to PodiumEngine™ via registered tournament_royale adapter.
 */
export async function resolveTournamentRoyalePodium(
  input: TournamentRoyalePodiumInput
): Promise<PodiumResolution | null> {
  if (input.standings.length < 2) return null;

  const outcome = await processContestPodium({
    kind: "tournament_royale",
    contestId: input.tournamentId,
    sport: "tournament_royale",
    seasonYear: input.seasonYear,
    label: input.tournamentLabel,
    context: {
      standings: input.standings,
      prizePoolCents: input.prizePoolCents,
      tournamentLabel: input.tournamentLabel,
    },
  });

  if (!outcome.podiumEnabled) return null;
  return outcome.resolution;
}
