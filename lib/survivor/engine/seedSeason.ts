import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  upsertDoubleLifeLeague,
  upsertGlobalClassicLeague,
  upsertTurboLeague,
} from "@/lib/survivor/db/leagues";
import { upsertSurvivorWeek } from "@/lib/survivor/db/weeks";
import { survivorWeekSpecsForMode } from "@/lib/survivor/nflWeeks";
import type { SurvivorMode } from "@/lib/survivor/types";

export interface SurvivorSeasonSeedResult {
  seasonYear: number;
  leagueId: string;
  doubleLifeLeagueId: string;
  turboLeagueId: string;
  weeksCreated: number;
}

export async function seedWeeksForLeague(
  leagueId: string,
  options?: { mode?: SurvivorMode }
): Promise<number> {
  const specs = survivorWeekSpecsForMode(options?.mode);
  let weeksCreated = 0;
  const isTurbo = options?.mode === "turbo";

  for (const spec of specs) {
    await upsertSurvivorWeek({
      leagueId,
      weekNumber: spec.weekNumber,
      label: spec.label,
      status:
        spec.weekNumber === 1 && !isTurbo
          ? "open"
          : "scheduled",
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

  const [classic, doubleLife, turbo] = await Promise.all([
    upsertGlobalClassicLeague(year),
    upsertDoubleLifeLeague(year),
    upsertTurboLeague(year),
  ]);

  const weeksCreated =
    (await seedWeeksForLeague(classic.id)) +
    (await seedWeeksForLeague(doubleLife.id)) +
    (await seedWeeksForLeague(turbo.id, { mode: "turbo" }));

  return {
    seasonYear: year,
    leagueId: classic.id,
    doubleLifeLeagueId: doubleLife.id,
    turboLeagueId: turbo.id,
    weeksCreated,
  };
}

export async function ensureSurvivorSeason(): Promise<{
  leagueId: string;
  seasonYear: number;
  doubleLifeLeagueId: string;
  turboLeagueId: string;
}> {
  const { meta } = await fetchPickemScoreboard({ sport: "nfl" });
  const seed = await seedSurvivorSeason(meta.seasonYear);
  return {
    leagueId: seed.leagueId,
    seasonYear: seed.seasonYear,
    doubleLifeLeagueId: seed.doubleLifeLeagueId,
    turboLeagueId: seed.turboLeagueId,
  };
}
