import type { PickemSport } from "@/lib/pickem/types";

export interface PickemSportConfig {
  id: PickemSport;
  label: string;
  platformGameId: "pickem" | "baseball-pickem" | "soccer-predictor" | "wnba-pickem";
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
  wnba: {
    id: "wnba",
    label: "WNBA",
    platformGameId: "wnba-pickem",
    espnPath: "basketball/wnba",
    defaultSeasonType: 2,
    enabled: true,
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
    enabled: true,
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
    label: "MLS",
    platformGameId: "soccer-predictor",
    espnPath: "soccer/usa.1",
    defaultSeasonType: 2,
    enabled: true,
  },
};

export const DEFAULT_PICKEM_SPORT: PickemSport = "nfl";

export function getPickemSportConfig(sport: PickemSport = DEFAULT_PICKEM_SPORT) {
  return PICKEM_SPORT_CONFIG[sport];
}

export function pickemScoreboardUrl(
  sport: PickemSport,
  week?: number,
  seasonType?: number,
  dates?: string
): string {
  const config = getPickemSportConfig(sport);
  const base = `https://site.api.espn.com/apis/site/v2/sports/${config.espnPath}/scoreboard`;
  const params = new URLSearchParams();
  if (dates) {
    params.set("dates", dates);
  } else {
    if (week != null) params.set("week", String(week));
    if (seasonType != null) params.set("seasontype", String(seasonType));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** ESPN season type: 2 = regular season, 3 = playoffs. */
export const PICKEM_SEASON_TYPE_REGULAR = 2;
export const PICKEM_SEASON_TYPE_PLAYOFFS = 3;

/** NFL regular season weeks (18 since 2021). */
export const NFL_REGULAR_WEEKS = 18;

/** NFL playoff round labels in ESPN week order. */
export const NFL_PLAYOFF_LABELS = [
  "Wild Card",
  "Divisional",
  "Conference Championships",
  "Super Bowl",
] as const;

/** MLB regular season weeks (~26). */
export const MLB_REGULAR_WEEKS = 26;

/** WNBA regular season weeks (~20). */
export const WNBA_REGULAR_WEEKS = 20;

/** WNBA playoff round labels. */
export const WNBA_PLAYOFF_LABELS = [
  "First Round",
  "Semifinals",
  "WNBA Finals",
] as const;

/** MLS regular season matchweeks. */
export const MLS_REGULAR_MATCHWEEKS = 34;

/** MLS playoff round labels. */
export const MLS_PLAYOFF_LABELS = [
  "Round 1",
  "Conference Semifinals",
  "Conference Final",
  "MLS Cup",
] as const;

/** MLB playoff round labels. */
export const MLB_PLAYOFF_LABELS = [
  "Wild Card",
  "Division Series",
  "Championship Series",
  "World Series",
] as const;

export function formatPickemWeekLabel(
  weekNumber: number,
  seasonType: number = PICKEM_SEASON_TYPE_REGULAR,
  sport: PickemSport = DEFAULT_PICKEM_SPORT
): string {
  if (seasonType === PICKEM_SEASON_TYPE_PLAYOFFS) {
    const labels =
      sport === "mlb"
        ? MLB_PLAYOFF_LABELS
        : sport === "soccer"
          ? MLS_PLAYOFF_LABELS
          : sport === "wnba"
            ? WNBA_PLAYOFF_LABELS
            : NFL_PLAYOFF_LABELS;
    return labels[weekNumber - 1] ?? `Playoff Week ${weekNumber}`;
  }
  if (sport === "soccer") return `Matchweek ${weekNumber}`;
  return `Week ${weekNumber}`;
}

export function pickemSeasonWeekSpecs(sport: PickemSport): PickemSeasonWeekSpec[] {
  if (sport === "mlb") return mlbSeasonWeekSpecs();
  if (sport === "nfl") return nflSeasonWeekSpecs();
  if (sport === "soccer") return soccerSeasonWeekSpecs();
  if (sport === "wnba") return wnbaSeasonWeekSpecs();
  const config = getPickemSportConfig(sport);
  return [
    {
      seasonType: config.defaultSeasonType,
      weekNumber: 1,
      label: formatPickemWeekLabel(1, config.defaultSeasonType, sport),
    },
  ];
}

/** Max players per pool before auto-creating the next pool for the same week + tier. */
export const PICKEM_LEAGUE_MAX_PLAYERS = 1000;

/** Default weekly prize pool display (cents) until real pool funding is wired. */
export const PICKEM_DEFAULT_PRIZE_POOL_CENTS = 500_000;

/** US Eastern timezone for Monday Night Football detection. */
export const PICKEM_EASTERN_TZ = "America/New_York";

export interface PickemSeasonWeekSpec {
  seasonType: number;
  weekNumber: number;
  label: string;
}

/** Full NFL calendar — regular season + playoffs. */
export function nflSeasonWeekSpecs(): PickemSeasonWeekSpec[] {
  const weeks: PickemSeasonWeekSpec[] = [];
  for (let w = 1; w <= NFL_REGULAR_WEEKS; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_REGULAR,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_REGULAR, "nfl"),
    });
  }
  for (let w = 1; w <= NFL_PLAYOFF_LABELS.length; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_PLAYOFFS, "nfl"),
    });
  }
  return weeks;
}

/** Full MLB calendar — regular season + playoffs. */
export function mlbSeasonWeekSpecs(): PickemSeasonWeekSpec[] {
  const weeks: PickemSeasonWeekSpec[] = [];
  for (let w = 1; w <= MLB_REGULAR_WEEKS; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_REGULAR,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_REGULAR, "mlb"),
    });
  }
  for (let w = 1; w <= MLB_PLAYOFF_LABELS.length; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_PLAYOFFS, "mlb"),
    });
  }
  return weeks;
}

/** Full MLS calendar — regular season matchweeks + playoffs. */
export function soccerSeasonWeekSpecs(): PickemSeasonWeekSpec[] {
  const weeks: PickemSeasonWeekSpec[] = [];
  for (let w = 1; w <= MLS_REGULAR_MATCHWEEKS; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_REGULAR,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_REGULAR, "soccer"),
    });
  }
  for (let w = 1; w <= MLS_PLAYOFF_LABELS.length; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_PLAYOFFS, "soccer"),
    });
  }
  return weeks;
}

/** Full WNBA calendar — regular season + playoffs. */
export function wnbaSeasonWeekSpecs(): PickemSeasonWeekSpec[] {
  const weeks: PickemSeasonWeekSpec[] = [];
  for (let w = 1; w <= WNBA_REGULAR_WEEKS; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_REGULAR,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_REGULAR, "wnba"),
    });
  }
  for (let w = 1; w <= WNBA_PLAYOFF_LABELS.length; w += 1) {
    weeks.push({
      seasonType: PICKEM_SEASON_TYPE_PLAYOFFS,
      weekNumber: w,
      label: formatPickemWeekLabel(w, PICKEM_SEASON_TYPE_PLAYOFFS, "wnba"),
    });
  }
  return weeks;
}
