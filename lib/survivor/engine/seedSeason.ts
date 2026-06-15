import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  upsertDoubleLifeLeague,
  upsertGlobalClassicLeague,
} from "@/lib/survivor/db/leagues";
import { upsertSurvivorWeek } from "@/lib/survivor/db/weeks";
import { survivorNflWeekSpecs } from "@/lib/survivor/nflWeeks";

export interface SurvivorSeasonSeedResult {
  seasonYear: number;
  leagueId: string;
  doubleLifeLeagueId: string;
  weeksCreated: number;
}

async function seedWeeksForLeague(leagueId: string): Promise<number> {
  const specs = survivorNflWeekSpecs();
  let weeksCreated = 0;

  for (const spec of specs) {
    await upsertSurvivorWeek({
      leagueId,
      weekNumber: spec.weekNumber,
      label: spec.label,
      status: spec.weekNumber === 1 ? "open" : "scheduled",
    });
    weeksCreated += 1;
  }

  return weeksCreated;
}

export async function seedSurvivorSeason(seasonYear?: number): Promise<SurvivorSeasonSeedResult> {
  let year = seasonYear;
  if (year == null) {
    const { meta } = await fetchPickemScoreboard({ sport: "nfl" });
    year = meta.seasonYear;
  }

  const [classic, doubleLife] = await Promise.all([
    upsertGlobalClassicLeague(year),
    upsertDoubleLifeLeague(year),
  ]);

  const weeksCreated =
    (await seedWeeksForLeague(classic.id)) + (await seedWeeksForLeague(doubleLife.id));

  return {
    seasonYear: year,
    leagueId: classic.id,
    doubleLifeLeagueId: doubleLife.id,
    weeksCreated,
  };
}

export async function ensureSurvivorSeason(): Promise<{
  leagueId: string;
  seasonYear: number;
  doubleLifeLeagueId: string;
}> {
  const { meta } = await fetchPickemScoreboard({ sport: "nfl" });
  const seed = await seedSurvivorSeason(meta.seasonYear);
  return {
    leagueId: seed.leagueId,
    seasonYear: seed.seasonYear,
    doubleLifeLeagueId: seed.doubleLifeLeagueId,
  };
}
