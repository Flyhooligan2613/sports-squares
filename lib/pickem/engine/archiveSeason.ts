import { listPickemContestsForSeason } from "@/lib/pickem/db/contests";
import { archivePickemSeason } from "@/lib/pickem/db/hallOfFame";
import {
  MLB_PLAYOFF_LABELS,
  NFL_PLAYOFF_LABELS,
  PICKEM_SEASON_TYPE_PLAYOFFS,
} from "@/lib/pickem/config";
import type { PickemSport } from "@/lib/pickem/types";

function championshipWeekForSport(sport: PickemSport): number {
  return sport === "mlb" ? MLB_PLAYOFF_LABELS.length : NFL_PLAYOFF_LABELS.length;
}

/**
 * After championship week completes, archive the full season to Hall of Fame.
 */
export async function maybeArchivePickemSeason(input: {
  sport: PickemSport;
  seasonYear: number;
  seasonType: number;
  weekNumber: number;
  contestStatus: string;
}): Promise<{ archived: boolean }> {
  const isChampionship =
    input.seasonType === PICKEM_SEASON_TYPE_PLAYOFFS &&
    input.weekNumber === championshipWeekForSport(input.sport);

  if (!isChampionship || input.contestStatus !== "complete") {
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
