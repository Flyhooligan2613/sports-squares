import type { EspnSport, ScoringPeriod } from "@/lib/types";

export interface EspnSportConfig {
  id: EspnSport;
  label: string;
  scoreboardUrl: string;
  summaryUrl: string;
  scoringPeriods: ScoringPeriod[];
  browseLabel: string;
}

export const ESPN_SPORTS: Record<EspnSport, EspnSportConfig> = {
  nfl: {
    id: "nfl",
    label: "NFL",
    scoreboardUrl:
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
    summaryUrl:
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary",
    scoringPeriods: ["Q1", "Q2", "Q3", "Q4", "FINAL"],
    browseLabel: "Browse NFL Games",
  },
  ncaaf: {
    id: "ncaaf",
    label: "NCAA Football",
    scoreboardUrl:
      "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
    summaryUrl:
      "https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary",
    scoringPeriods: ["Q1", "Q2", "Q3", "Q4", "FINAL"],
    browseLabel: "Browse NCAA Football Games",
  },
  nba: {
    id: "nba",
    label: "NBA",
    scoreboardUrl:
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
    summaryUrl:
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary",
    scoringPeriods: ["Q1", "Q2", "Q3", "Q4", "FINAL"],
    browseLabel: "Browse NBA Games",
  },
  ncaab: {
    id: "ncaab",
    label: "NCAA Basketball",
    scoreboardUrl:
      "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
    summaryUrl:
      "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary",
    scoringPeriods: ["1H", "2H", "FINAL"],
    browseLabel: "Browse NCAA Basketball Games",
  },
};

export const ESPN_SPORT_LIST = Object.values(ESPN_SPORTS);

export const DEFAULT_ESPN_SPORT: EspnSport = "nfl";

export function normalizeEspnSport(value: string | undefined | null): EspnSport {
  if (value && value in ESPN_SPORTS) return value as EspnSport;
  return DEFAULT_ESPN_SPORT;
}

export function getEspnSportConfig(sport?: EspnSport | null): EspnSportConfig {
  return ESPN_SPORTS[normalizeEspnSport(sport)];
}

export function getScoringPeriods(sport?: EspnSport | null): ScoringPeriod[] {
  return getEspnSportConfig(sport).scoringPeriods;
}

export function getDefaultScoringPeriod(sport?: EspnSport | null): ScoringPeriod {
  return getScoringPeriods(sport)[0];
}
