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

export type SurvivorPickResult = "pending" | "survived" | "eliminated" | "push";

export type SurvivorHofCategory =
  | "perfect_season"
  | "longest_streak"
  | "champion"
  | "fastest_champion"
  | "community_favorite"
  | "most_seasons";

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
}
