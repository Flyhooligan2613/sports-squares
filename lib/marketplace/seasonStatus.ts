import type { EspnSport } from "@/lib/types";

export interface MarketplaceSeasonStatus {
  offSeason: boolean;
  headline: string;
  message: string;
  returnHint?: string;
}

/** Sports forced into off-season UI (empty — use live ESPN schedules instead). */
const OFF_SEASON: Partial<
  Record<EspnSport, Omit<MarketplaceSeasonStatus, "offSeason">>
> = {};

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
