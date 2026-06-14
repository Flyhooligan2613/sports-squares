import type { EspnSport } from "@/lib/types";

export const MARKETPLACE_SPORTS: EspnSport[] = [
  "nfl",
  "ncaaf",
  "nba",
  "ncaab",
  "mlb",
];

/** Default square price when auto-creating marketplace boards. */
export const DEFAULT_COST_PER_SQUARE: Record<EspnSport, number> = {
  nfl: 10,
  ncaaf: 5,
  nba: 10,
  ncaab: 5,
  mlb: 5,
};

export function isMarketplaceMode(): boolean {
  return process.env.NEXT_PUBLIC_MARKETPLACE_MODE !== "false";
}

export function getDefaultCostForSport(sport: EspnSport): number {
  return DEFAULT_COST_PER_SQUARE[sport] ?? 10;
}
