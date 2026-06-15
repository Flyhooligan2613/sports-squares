import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  upsertDoubleLifeLeague,
  upsertGlobalClassicLeague,
  upsertTurboLeague,
} from "@/lib/survivor/db/leagues";
import { upsertSurvivorWeek } from "@/lib/survivor/db/weeks";
import { SURVIVOR_DEFAULT_SPORT } from "@/lib/survivor/config";
import { survivorSportToPickem } from "@/lib/survivor/sports";
import { survivorWeekSpecsForMode } from "@/lib/survivor/weekSpecs";
import type { SurvivorMode, SurvivorSport } from "@/lib/survivor/types";

export interface SurvivorSeasonSeedResult {
  sport: SurvivorSport;
  seasonYear: number;
  leagueId: string;
  doubleLifeLeagueId: string;
  turboLeagueId: string | null;
  weeksCreated: number;
}

export async function seedWeeksForLeague(
  leagueId: string,
  options?: { mode?: SurvivorMode; sport?: SurvivorSport }
): Promise<number> {
  const sport = options?.sport ?? "nfl";
  const specs = survivorWeekSpecsForMode(options?.mode, sport);
  let weeksCreated = 0;
  const isTurbo = options?.mode === "turbo" && sport === "nfl";

  for (const spec of specs) {
    await upsertSurvivorWeek({
      leagueId,
      weekNumber: spec.weekNumber,
      label: spec.label,
      status: spec.weekNumber === 1 && !isTurbo ? "open" : "scheduled",
    });
    weeksCreated += 1;
  }

  return weeksCreated;
}

export async function seedSurvivorSeason(
  sport: SurvivorSport = SURVIVOR_DEFAULT_SPORT,
  seasonYear?: number
): Promise<SurvivorSeasonSeedResult> {
  const pickemSport = survivorSportToPickem(sport);
  let year = seasonYear;
  if (year == null) {
    const { meta } = await fetchPickemScoreboard({ sport: pickemSport });
    year = meta.seasonYear;
  }

  const [classic, doubleLife] = await Promise.all([
    upsertGlobalClassicLeague(year, sport),
    upsertDoubleLifeLeague(year, sport),
  ]);

  const turbo = sport === "nfl" ? await upsertTurboLeague(year) : null;

  let weeksCreated =
    (await seedWeeksForLeague(classic.id, { sport })) +
    (await seedWeeksForLeague(doubleLife.id, { sport }));

  if (turbo) {
    weeksCreated += await seedWeeksForLeague(turbo.id, { mode: "turbo", sport: "nfl" });
  }

  return {
    sport,
    seasonYear: year,
    leagueId: classic.id,
    doubleLifeLeagueId: doubleLife.id,
    turboLeagueId: turbo?.id ?? null,
    weeksCreated,
  };
}

export async function ensureSurvivorSeason(
  sport: SurvivorSport = SURVIVOR_DEFAULT_SPORT
): Promise<{
  sport: SurvivorSport;
  leagueId: string;
  seasonYear: number;
  doubleLifeLeagueId: string;
  turboLeagueId: string | null;
}> {
  const pickemSport = survivorSportToPickem(sport);
  const { meta } = await fetchPickemScoreboard({ sport: pickemSport });
  const seed = await seedSurvivorSeason(sport, meta.seasonYear);
  return {
    sport: seed.sport,
    leagueId: seed.leagueId,
    seasonYear: seed.seasonYear,
    doubleLifeLeagueId: seed.doubleLifeLeagueId,
    turboLeagueId: seed.turboLeagueId,
  };
}
