export type LiveArenaPhase =
  | "landing"
  | "dashboard"
  | "opening"
  | "live"
  | "quarter-break"
  | "halftime"
  | "complete"
  | "wallet-reward";

export type UserSquareStatus = "winning" | "active" | "in-play";

export type ContestUserStatus =
  | "winning"
  | "active"
  | "in-play"
  | "watching"
  | "upcoming";

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

export type DemoEventKind =
  | "kickoff"
  | "tick"
  | "touchdown"
  | "field-goal"
  | "safety"
  | "quarter-end"
  | "halftime"
  | "big-play"
  | "final";

export interface DemoScoreEvent {
  quarter: 1 | 2 | 3 | 4;
  clock: string;
  awayScore: number;
  homeScore: number;
  label?: string;
  pauseMs?: number;
  kind?: DemoEventKind;
  /** 0–1 crowd energy for ambience volume */
  crowdLevel?: number;
}

export type BoardRevealPhase =
  | "hidden"
  | "grid"
  | "numbers"
  | "owned"
  | "complete";

export type ScoreReactionPhase =
  | "idle"
  | "score-flash"
  | "board-pause"
  | "signature"
  | "illuminate";

export interface UserSquareMeta {
  squareId: number;
  displayNumber: number;
  potentialPayout: number;
  historicalWinRate: number;
  quartersWon: number[];
  status: UserSquareStatus;
}

export interface ContestCenterStats {
  activeContests: number;
  potentialWinnings: number;
  walletBalance: number;
  winningBoards: number;
  upcomingGames: number;
  contestHistoryCount: number;
}

export interface LiveContestSummary extends LiveContest {
  awayScore?: number;
  homeScore?: number;
  quarter?: number;
  clock?: string;
  userStatus: ContestUserStatus;
  startTime?: string;
}

export interface LiveArenaStats {
  playersLive: number;
  paidToday: number;
  winners: number;
  boardsActive: number;
}

export type DockTab = "games" | "winning" | "wallet" | "rewards" | "profile";
