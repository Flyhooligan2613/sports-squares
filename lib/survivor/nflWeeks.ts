import {
  formatPickemWeekLabel,
  nflSeasonWeekSpecs,
  PICKEM_SEASON_TYPE_PLAYOFFS,
  PICKEM_SEASON_TYPE_REGULAR,
} from "@/lib/pickem/config";

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

export function espnMetaForSurvivorWeekNumber(weekNumber: number): {
  seasonType: number;
  espnWeekNumber: number;
  label: string;
} {
  const spec = survivorNflWeekSpecs().find((w) => w.weekNumber === weekNumber);
  if (!spec) {
    return {
      seasonType: PICKEM_SEASON_TYPE_REGULAR,
      espnWeekNumber: weekNumber,
      label: formatPickemWeekLabel(weekNumber, PICKEM_SEASON_TYPE_REGULAR, "nfl"),
    };
  }
  return {
    seasonType: spec.seasonType,
    espnWeekNumber: spec.espnWeekNumber,
    label: spec.label,
  };
}
