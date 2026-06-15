import type { EspnSport } from "@/lib/types";

export interface MarketplaceSeasonStatus {
  offSeason: boolean;
  headline: string;
  message: string;
  returnHint?: string;
}

/** Sports forced into off-season UI — empty by default; use live ESPN schedules. */
const OFF_SEASON: Partial<
  Record<EspnSport, Omit<MarketplaceSeasonStatus, "offSeason">>
> = {};

/** Off-season copy registry — wire into OFF_SEASON when a sport enters off-season. */
export { WNBA_OFF_SEASON_COPY } from "@/lib/wnba/seasonEvents";

export function getMarketplaceSeasonStatus(
  sport: EspnSport
): MarketplaceSeasonStatus {
  const config = OFF_SEASON[sport];
  if (config) {
    return { offSeason: true, ...config };
  }
  return { offSeason: false, headline: "", message: "" };
}

export function isMarketplaceOffSeason(sport: EspnSport): boolean {
  return getMarketplaceSeasonStatus(sport).offSeason;
}
