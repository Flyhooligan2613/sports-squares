import type { PodiumAwardResult, PodiumResolution } from "@/lib/platform/engines/podium/types";
import { processContestPodium } from "@/lib/platform/engines/podium/PodiumEngine";
import type { PickemLeague } from "@/lib/pickem/db/leagues";
import type { PickemContest, PickemSport } from "@/lib/pickem/types";

export interface PickemLeaguePodiumResult {
  resolution: PodiumResolution;
  award: PodiumAwardResult;
  podiumEnabled: boolean;
}

/**
 * Resolve and award podium for a completed Pick'em league week.
 * Delegates to PodiumEngine™ via registered pickem_weekly adapter.
 */
export async function resolvePickemLeaguePodium(input: {
  contestId: string;
  leagueId: string;
  contest: PickemContest;
  league: PickemLeague;
  winnerEmails: string[];
  splitEqually: boolean;
  tiebreakerUsed: boolean;
}): Promise<PickemLeaguePodiumResult> {
  const outcome = await processContestPodium({
    kind: "pickem_weekly",
    contestId: input.contestId,
    leagueId: input.leagueId,
    sport: input.contest.sport,
    seasonYear: input.contest.seasonYear,
    label: `${input.contest.label} · Pool #${input.league.leagueNumber}`,
    firstPlaceEmails: input.winnerEmails,
    context: {
      contest: input.contest,
      league: input.league,
      splitEqually: input.splitEqually,
      tiebreakerUsed: input.tiebreakerUsed,
    },
  });

  return {
    resolution: outcome.resolution,
    award: outcome.award,
    podiumEnabled: outcome.podiumEnabled,
  };
}

/** Season championship podium — prestige rewards, no league cash pool. */
export async function resolvePickemSeasonPodium(input: {
  sport: PickemSport;
  seasonYear: number;
  archiveId: string;
}): Promise<PodiumAwardResult | null> {
  const outcome = await processContestPodium({
    kind: "pickem_season",
    contestId: input.archiveId,
    sport: input.sport,
    seasonYear: input.seasonYear,
    label: `${input.sport.toUpperCase()} Pick'em ${input.seasonYear} Season`,
    context: {
      sport: input.sport,
      seasonYear: input.seasonYear,
    },
  });

  if (!outcome.podiumEnabled || outcome.resolution.placements.length < 3) {
    return null;
  }

  return outcome.award;
}
