import { listPickemContestsForSeason } from "@/lib/pickem/db/contests";
import { archivePickemSeason } from "@/lib/pickem/db/hallOfFame";
import {
  PICKEM_SEASON_TYPE_PLAYOFFS,
  NFL_PLAYOFF_LABELS,
} from "@/lib/pickem/config";
import type { PickemSport } from "@/lib/pickem/types";

const SUPER_BOWL_WEEK = NFL_PLAYOFF_LABELS.length;

/**
 * After Super Bowl completes, archive the full season to Hall of Fame.
 */
export async function maybeArchivePickemSeason(input: {
  sport: PickemSport;
  seasonYear: number;
  seasonType: number;
  weekNumber: number;
  contestStatus: string;
}): Promise<{ archived: boolean }> {
  const isSuperBowl =
    input.seasonType === PICKEM_SEASON_TYPE_PLAYOFFS &&
    input.weekNumber === SUPER_BOWL_WEEK;

  if (!isSuperBowl || input.contestStatus !== "complete") {
    return { archived: false };
  }

  const weeks = await listPickemContestsForSeason({
    sport: input.sport,
    seasonYear: input.seasonYear,
  });

  const result = await archivePickemSeason({
    sport: input.sport,
    seasonYear: input.seasonYear,
    totalWeeks: weeks.length,
  });

  return { archived: result.archived };
}
