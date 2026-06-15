import { DEFAULT_PICKEM_SPORT, getPickemSportConfig } from "@/lib/pickem/config";
import type { PickemSport } from "@/lib/pickem/types";

const VALID_SPORTS = new Set<PickemSport>(["nfl", "mlb", "ncaaf", "nba", "wnba", "ncaab", "nhl", "soccer"]);

export function parsePickemSport(value: string | null | undefined): PickemSport {
  const normalized = value?.trim().toLowerCase();
  if (normalized && VALID_SPORTS.has(normalized as PickemSport)) {
    return normalized as PickemSport;
  }
  return DEFAULT_PICKEM_SPORT;
}

export function resolvePickemSportFromRequest(request: Request): PickemSport {
  const url = new URL(request.url);
  return parsePickemSport(url.searchParams.get("sport"));
}

export function assertPickemSportEnabled(sport: PickemSport): void {
  const config = getPickemSportConfig(sport);
  if (!config.enabled) {
    throw new Error(`${config.label} Pick'em is not available yet.`);
  }
}

export const ENABLED_PICKEM_SPORTS: PickemSport[] = ["nfl", "mlb", "soccer", "wnba"];
