import {
  formatPickemWeekLabel,
  NFL_PLAYOFF_LABELS,
  nflSeasonWeekSpecs,
  PICKEM_SEASON_TYPE_PLAYOFFS,
  PICKEM_SEASON_TYPE_REGULAR,
} from "@/lib/pickem/config";
import type { SurvivorMode } from "@/lib/survivor/types";

export interface SurvivorNflWeekSpec {
  weekNumber: number;
  label: string;
  seasonType: number;
  espnWeekNumber: number;
}

export function survivorNflWeekSpecs(): SurvivorNflWeekSpec[] {
  return nflSeasonWeekSpecs().map((spec, index) => ({
    weekNumber: index + 1,
    label: spec.label,
    seasonType: spec.seasonType,
    espnWeekNumber: spec.weekNumber,
  }));
}

export function survivorTurboWeekSpecs(): SurvivorNflWeekSpec[] {
  return NFL_PLAYOFF_LABELS.map((label, index) => ({
    weekNumber: index + 1,
    label,
    seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
    espnWeekNumber: index + 1,
  }));
}

export function survivorWeekSpecsForMode(mode?: SurvivorMode): SurvivorNflWeekSpec[] {
  return mode === "turbo" ? survivorTurboWeekSpecs() : survivorNflWeekSpecs();
}

export function espnMetaForSurvivorWeekNumber(
  weekNumber: number,
  options?: { mode?: SurvivorMode }
): {
  seasonType: number;
  espnWeekNumber: number;
  label: string;
} {
  const specs = survivorWeekSpecsForMode(options?.mode);
  const spec = specs.find((w) => w.weekNumber === weekNumber);
  if (!spec) {
    const fallbackSeasonType =
      options?.mode === "turbo"
        ? PICKEM_SEASON_TYPE_PLAYOFFS
        : PICKEM_SEASON_TYPE_REGULAR;
    return {
      seasonType: fallbackSeasonType,
      espnWeekNumber: weekNumber,
      label: formatPickemWeekLabel(weekNumber, fallbackSeasonType, "nfl"),
    };
  }
  return {
    seasonType: spec.seasonType,
    espnWeekNumber: spec.espnWeekNumber,
    label: spec.label,
  };
}
