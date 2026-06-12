import {
  DEFAULT_PICKEM_SPORT,
  getPickemSportConfig,
  nflSeasonWeekSpecs,
  PICKEM_DEFAULT_PRIZE_POOL_CENTS,
  PICKEM_SEASON_TYPE_PLAYOFFS,
  PICKEM_SEASON_TYPE_REGULAR,
} from "@/lib/pickem/config";
import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import { getPickemContestForWeek, upsertPickemContest } from "@/lib/pickem/db/contests";
import type { PickemSport } from "@/lib/pickem/types";

export interface PickemSeasonSeedResult {
  sport: PickemSport;
  seasonYear: number;
  contestsCreated: number;
  contestsExisting: number;
}

/**
 * Pre-provision every NFL week (regular + playoffs) for the season.
 * Games are imported lazily when each week becomes active.
 */
export async function seedPickemSeason(
  sport: PickemSport = DEFAULT_PICKEM_SPORT,
  seasonYear?: number
): Promise<PickemSeasonSeedResult> {
  const config = getPickemSportConfig(sport);
  if (!config.enabled) {
    return { sport, seasonYear: seasonYear ?? new Date().getFullYear(), contestsCreated: 0, contestsExisting: 0 };
  }

  let year = seasonYear;
  if (year == null) {
    const { meta } = await fetchPickemScoreboard({ sport });
    year = meta.seasonYear;
  }

  let contestsCreated = 0;
  let contestsExisting = 0;

  const specs =
    sport === "nfl"
      ? nflSeasonWeekSpecs()
      : [
          {
            seasonType: config.defaultSeasonType,
            weekNumber: 1,
            label: "Week 1",
          },
        ];

  for (const spec of specs) {
    const existing = await getPickemContestForWeek({
      sport,
      seasonYear: year,
      seasonType: spec.seasonType,
      weekNumber: spec.weekNumber,
    });

    await upsertPickemContest({
      sport,
      seasonYear: year,
      seasonType: spec.seasonType,
      weekNumber: spec.weekNumber,
      label: spec.label,
      status: "open",
      prizePoolCents: PICKEM_DEFAULT_PRIZE_POOL_CENTS,
    });

    if (existing) contestsExisting += 1;
    else contestsCreated += 1;
  }

  void PICKEM_SEASON_TYPE_REGULAR;
  void PICKEM_SEASON_TYPE_PLAYOFFS;

  return {
    sport,
    seasonYear: year,
    contestsCreated,
    contestsExisting,
  };
}
