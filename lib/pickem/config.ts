import type { PickemSport } from "@/lib/pickem/types";

export interface PickemSportConfig {
  id: PickemSport;
  label: string;
  platformGameId: "pickem" | "baseball-pickem" | "soccer-predictor";
  espnPath: string;
  /** Default ESPN season type (2 = NFL regular season). */
  defaultSeasonType: number;
  enabled: boolean;
}

export const PICKEM_SPORT_CONFIG: Record<PickemSport, PickemSportConfig> = {
  nfl: {
    id: "nfl",
    label: "NFL",
    platformGameId: "pickem",
    espnPath: "football/nfl",
    defaultSeasonType: 2,
    enabled: true,
  },
  ncaaf: {
    id: "ncaaf",
    label: "College Football",
    platformGameId: "pickem",
    espnPath: "football/college-football",
    defaultSeasonType: 2,
    enabled: false,
  },
  nba: {
    id: "nba",
    label: "NBA",
    platformGameId: "pickem",
    espnPath: "basketball/nba",
    defaultSeasonType: 2,
    enabled: false,
  },
  ncaab: {
    id: "ncaab",
    label: "NCAA Basketball",
    platformGameId: "pickem",
    espnPath: "basketball/mens-college-basketball",
    defaultSeasonType: 2,
    enabled: false,
  },
  mlb: {
    id: "mlb",
    label: "MLB",
    platformGameId: "baseball-pickem",
    espnPath: "baseball/mlb",
    defaultSeasonType: 2,
    enabled: false,
  },
  nhl: {
    id: "nhl",
    label: "NHL",
    platformGameId: "pickem",
    espnPath: "hockey/nhl",
    defaultSeasonType: 2,
    enabled: false,
  },
  soccer: {
    id: "soccer",
    label: "Soccer",
    platformGameId: "soccer-predictor",
    espnPath: "soccer/usa.1",
    defaultSeasonType: 2,
    enabled: false,
  },
};

export const DEFAULT_PICKEM_SPORT: PickemSport = "nfl";

export function getPickemSportConfig(sport: PickemSport = DEFAULT_PICKEM_SPORT) {
  return PICKEM_SPORT_CONFIG[sport];
}

export function pickemScoreboardUrl(
  sport: PickemSport,
  week?: number,
  seasonType?: number
): string {
  const config = getPickemSportConfig(sport);
  const base = `https://site.api.espn.com/apis/site/v2/sports/${config.espnPath}/scoreboard`;
  const params = new URLSearchParams();
  if (week != null) params.set("week", String(week));
  if (seasonType != null) params.set("seasontype", String(seasonType));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function formatPickemWeekLabel(weekNumber: number): string {
  return `Week ${weekNumber}`;
}

/** Default weekly prize pool display (cents) until real pool funding is wired. */
export const PICKEM_DEFAULT_PRIZE_POOL_CENTS = 500_000;
