import type { EspnSport, PayoutStatus, ScoringPeriod } from "@/lib/types";

export interface LivePlatformStatus {
  platformOnline: boolean;
  activeGames: number;
  activeBoards: number;
  playersOnline: number;
  squaresPurchasedToday: number;
  automaticPayoutsToday: number;
  prizeMoneyPaidToday: number;
  gamesCurrentlyLive: number;
}

export interface LiveWinnersStats {
  todaysWinners: number;
  todaysPayouts: number;
  boardsPlayed: number;
  squaresSold: number;
  prizeMoneyToday: number;
}

export type LiveGameStatus = "live" | "upcoming" | "final";

export interface LiveWinnerFeedItem {
  id: string;
  sport: string;
  sportKey: EspnSport | null;
  awayTeam: string;
  homeTeam: string;
  boardIndex: number;
  quarter: ScoringPeriod;
  periodLabel: string;
  periodShort: string;
  amount: number;
  maskedWinner: string;
  payoutStatus: PayoutStatus;
  wonAt: string;
  homeScore: number | null;
  awayScore: number | null;
  winningSquare: number | null;
  gameStatus: LiveGameStatus | null;
  livePeriod: number | null;
  liveClock: string | null;
  liveHomeScore: number | null;
  liveAwayScore: number | null;
}

export type LiveActivityType =
  | "board_filled"
  | "board_created"
  | "numbers_assigned"
  | "squares_purchased"
  | "kickoff_started"
  | "quarter_winner"
  | "final_winner"
  | "payout_sent"
  | "game_opened"
  | "streak_milestone";

export interface LiveActivityItem {
  id: string;
  type: LiveActivityType;
  title: string;
  detail: string;
  at: string;
  accent?: "green" | "blue" | "purple" | "gold" | "yellow" | "red";
}

export interface ChampionEntry {
  maskedName: string;
  totalWon: number;
}

export interface BigWinToday {
  id: string;
  amount: number;
  awayTeam: string;
  homeTeam: string;
  boardIndex: number;
  paidAt: string;
  maskedWinner: string;
}

export interface TickerPayout {
  id: string;
  amount: number;
}

export interface LiveWinnersCenterData {
  platform: LivePlatformStatus;
  stats: LiveWinnersStats;
  bigWin: BigWinToday | null;
  ticker: TickerPayout[];
  winners: LiveWinnerFeedItem[];
  activity: LiveActivityItem[];
  champions: {
    today: ChampionEntry[];
    week: ChampionEntry[];
    month: ChampionEntry[];
  };
  updatedAt: string;
}
