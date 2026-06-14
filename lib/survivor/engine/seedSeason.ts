import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  getGlobalClassicLeague,
  upsertGlobalClassicLeague,
} from "@/lib/survivor/db/leagues";
import { upsertSurvivorWeek } from "@/lib/survivor/db/weeks";
import { survivorNflWeekSpecs } from "@/lib/survivor/nflWeeks";

export interface SurvivorSeasonSeedResult {
  seasonYear: number;
  leagueId: string;
  weeksCreated: number;
}

export async function seedSurvivorSeason(seasonYear?: number): Promise<SurvivorSeasonSeedResult> {
  let year = seasonYear;
  if (year == null) {
    const { meta } = await fetchPickemScoreboard({ sport: "nfl" });
    year = meta.seasonYear;
  }

  const league = await upsertGlobalClassicLeague(year);
  const specs = survivorNflWeekSpecs();
  let weeksCreated = 0;

  for (const spec of specs) {
    const existing = await getGlobalClassicLeague(year);
    void existing;
    await upsertSurvivorWeek({
      leagueId: league.id,
      weekNumber: spec.weekNumber,
      label: spec.label,
      status: spec.weekNumber === 1 ? "open" : "scheduled",
    });
    weeksCreated += 1;
  }

  return { seasonYear: year, leagueId: league.id, weeksCreated };
}

export async function ensureSurvivorSeason(): Promise<{
  leagueId: string;
  seasonYear: number;
}> {
  const { meta } = await fetchPickemScoreboard({ sport: "nfl" });
  const seed = await seedSurvivorSeason(meta.seasonYear);
  return { leagueId: seed.leagueId, seasonYear: seed.seasonYear };
}
