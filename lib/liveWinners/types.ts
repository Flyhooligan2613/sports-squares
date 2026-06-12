import type { EspnSport, PayoutStatus, ScoringPeriod } from "@/lib/types";

export interface LiveWinnersStats {
  todaysWinners: number;
  todaysPayouts: number;
  boardsPlayed: number;
  squaresSold: number;
  prizeMoneyToday: number;
}

export interface LiveWinnerFeedItem {
  id: string;
  sport: string;
  sportKey: EspnSport | null;
  awayTeam: string;
  homeTeam: string;
  boardIndex: number;
  periodLabel: string;
  amount: number;
  payoutStatus: PayoutStatus;
  wonAt: string;
}

export type LiveActivityType =
  | "board_filled"
  | "board_created"
  | "numbers_assigned"
  | "squares_purchased"
  | "kickoff_started"
  | "quarter_winner"
  | "payout_sent";

export interface LiveActivityItem {
  id: string;
  type: LiveActivityType;
  title: string;
  detail: string;
  at: string;
}

export interface ChampionEntry {
  maskedName: string;
  totalWon: number;
}

export interface LiveWinnersCenterData {
  stats: LiveWinnersStats;
  winners: LiveWinnerFeedItem[];
  activity: LiveActivityItem[];
  champions: {
    today: ChampionEntry[];
    week: ChampionEntry[];
    month: ChampionEntry[];
  };
  updatedAt: string;
}
