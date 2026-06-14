import type { EspnSport } from "@/lib/types";

export interface MarketplaceSeasonStatus {
  offSeason: boolean;
  headline: string;
  message: string;
  returnHint?: string;
}

const OFF_SEASON: Partial<
  Record<EspnSport, Omit<MarketplaceSeasonStatus, "offSeason">>
> = {
  nba: {
    headline: "See you next season",
    message:
      "The NBA season has wrapped. SquareBoards will be back when the next slate opens — same 10×10 boards, live quarter scoring, Highlight Squares™, and automatic payouts.",
    returnHint: "Boards return when the next NBA season kicks off.",
  },
};

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
