export type SurvivorSport = "nfl" | "ncaaf" | "nba" | "mlb" | "nhl" | "soccer";

export type SurvivorMode =
  | "classic"
  | "double_life"
  | "turbo"
  | "global"
  | "private";

export type SurvivorLeagueStatus =
  | "draft"
  | "open"
  | "active"
  | "complete"
  | "archived";

export type SurvivorEntryStatus = "active" | "eliminated" | "champion";

export type SurvivorWeekStatus =
  | "scheduled"
  | "open"
  | "locked"
  | "scoring"
  | "complete";

export type SurvivorPickResult =
  | "pending"
  | "survived"
  | "eliminated"
  | "push"
  | "shield_saved";

export type SurvivorHofCategory =
  | "perfect_season"
  | "longest_streak"
  | "champion"
  | "fastest_champion"
  | "community_favorite"
  | "most_seasons"
  | "shield_savior"
  | "untouchable";

export interface SurvivorModeDefinition {
  id: SurvivorMode;
  emoji: string;
  title: string;
  description: string;
  lives: number;
  badge?: string;
  available: boolean;
}

export interface SurvivorLiveMapStats {
  playersRemaining: number;
  eliminatedToday: number;
  perfectPlayersRemaining: number;
  mostPopularPick: string | null;
  upsetRiskTeam: string | null;
  survivorRatePct: number;
  shieldsActivated: number;
}

export interface SurvivorGameOption {
  espnGameId: string;
  awayTeam: string;
  homeTeam: string;
  teamAbbr: string;
  teamName: string;
  kickoffAt: string;
  status: string;
  awayScore: number;
  homeScore: number;
  picksLocked: boolean;
  isSelected: boolean;
  isUsedTeam: boolean;
}

export interface SurvivorWeekView {
  league: {
    id: string;
    name: string;
    seasonYear: number;
    status: SurvivorLeagueStatus;
    currentWeek: number;
  };
  week: {
    id: string;
    weekNumber: number;
    label: string;
    status: SurvivorWeekStatus;
    locksAt: string | null;
  };
  entry: {
    id: string;
    status: SurvivorEntryStatus;
    livesRemaining: number;
    weeksSurvived: number;
    displayName: string;
    shieldAvailable: boolean;
    shieldUsedWeek: number | null;
  } | null;
  games: SurvivorGameOption[];
  usedTeams: string[];
  myPick: {
    teamAbbr: string;
    teamName: string;
    result: SurvivorPickResult;
  } | null;
  liveMap: SurvivorLiveMapStats;
  canPick: boolean;
}
