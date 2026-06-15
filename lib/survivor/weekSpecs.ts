import {
  formatPickemWeekLabel,
  NFL_PLAYOFF_LABELS,
  pickemSeasonWeekSpecs,
  PICKEM_SEASON_TYPE_PLAYOFFS,
  PICKEM_SEASON_TYPE_REGULAR,
} from "@/lib/pickem/config";
import { survivorSportToPickem } from "@/lib/survivor/sports";
import type { SurvivorMode, SurvivorSport } from "@/lib/survivor/types";

export interface SurvivorWeekSpec {
  weekNumber: number;
  label: string;
  seasonType: number;
  espnWeekNumber: number;
}

export function survivorSeasonWeekSpecs(sport: SurvivorSport = "nfl"): SurvivorWeekSpec[] {
  const pickemSport = survivorSportToPickem(sport);
  return pickemSeasonWeekSpecs(pickemSport).map((spec, index) => ({
    weekNumber: index + 1,
    label: spec.label,
    seasonType: spec.seasonType,
    espnWeekNumber: spec.weekNumber,
  }));
}

export function survivorTurboWeekSpecs(): SurvivorWeekSpec[] {
  return NFL_PLAYOFF_LABELS.map((label, index) => ({
    weekNumber: index + 1,
    label,
    seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
    espnWeekNumber: index + 1,
  }));
}

export function survivorWeekSpecsForMode(
  mode?: SurvivorMode,
  sport: SurvivorSport = "nfl"
): SurvivorWeekSpec[] {
  if (mode === "turbo" && sport === "nfl") return survivorTurboWeekSpecs();
  return survivorSeasonWeekSpecs(sport);
}

export function espnMetaForSurvivorWeekNumber(
  weekNumber: number,
  options?: { mode?: SurvivorMode; sport?: SurvivorSport }
): {
  seasonType: number;
  espnWeekNumber: number;
  label: string;
} {
  const sport = options?.sport ?? "nfl";
  const specs = survivorWeekSpecsForMode(options?.mode, sport);
  const spec = specs.find((w) => w.weekNumber === weekNumber);
  const pickemSport = survivorSportToPickem(sport);

  if (!spec) {
    const fallbackSeasonType =
      options?.mode === "turbo"
        ? PICKEM_SEASON_TYPE_PLAYOFFS
        : PICKEM_SEASON_TYPE_REGULAR;
    return {
      seasonType: fallbackSeasonType,
      espnWeekNumber: weekNumber,
      label: formatPickemWeekLabel(weekNumber, fallbackSeasonType, pickemSport),
    };
  }
  return {
    seasonType: spec.seasonType,
    espnWeekNumber: spec.espnWeekNumber,
    label: spec.label,
  };
}
