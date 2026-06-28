export type LiveArenaPhase =
  | "landing"
  | "opening"
  | "live"
  | "quarter-break"
  | "halftime"
  | "complete"
  | "wallet-reward";

export type ContestSport = "nfl" | "nba" | "mlb" | "pickem";

export interface LiveContest {
  id: string;
  awayTeam: string;
  awayAbbr: string;
  homeTeam: string;
  homeAbbr: string;
  sport: ContestSport;
  prizePool: number;
  contestType: string;
  topNumbers: number[];
  sideNumbers: number[];
  innerNumbers: number[];
  isLive: boolean;
}

export interface DemoScoreEvent {
  quarter: 1 | 2 | 3 | 4;
  clock: string;
  awayScore: number;
  homeScore: number;
  label?: string;
  pauseMs?: number;
}

export interface UserSquareMeta {
  squareId: number;
  displayNumber: number;
  potentialPayout: number;
  historicalWinRate: number;
  quartersWon: number[];
}

export interface LiveArenaStats {
  playersLive: number;
  paidToday: number;
  winners: number;
  boardsActive: number;
}

export type DockTab = "games" | "winning" | "wallet" | "rewards" | "profile";
