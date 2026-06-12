import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";

export interface PlayerDashboardStats {
  totalWinnings: number;
  lifetimeWins: number;
  activeBoards: number;
  upcomingGames: number;
}

export interface PlayerActiveGame {
  poolId: string;
  inviteToken: string | null;
  homeTeam: string;
  awayTeam: string;
  boardIndex: number;
  isLive: boolean;
  kickoffLabel: string;
  homeScore: number | null;
  awayScore: number | null;
  ownedSquares: number[];
  currentQuarterWinner: string | null;
  currentPeriod: string | null;
  potentialPrize: number | null;
}

export interface PlayerUpcomingGame {
  poolId: string;
  inviteToken: string | null;
  homeTeam: string;
  awayTeam: string;
  boardIndex: number;
  kickoffAt: string;
  ownedSquareCount: number;
}

export interface PlayerRecentWin {
  id: string;
  homeTeam: string;
  awayTeam: string;
  periodLabel: string;
  amount: number;
  payoutStatus: "pending" | "paid" | "unpaid";
  wonAt: string;
}

export interface PlayerNotification {
  id: string;
  type:
    | "board_filled"
    | "numbers_assigned"
    | "quarter_winner"
    | "payment_sent"
    | "game_starting"
    | "pickem_week_open"
    | "pickem_pool_almost_full"
    | "pickem_pool_full"
    | "pickem_sunday_complete"
    | "pickem_championship"
    | "pickem_prediction_due"
    | "pickem_prediction_locked"
    | "pickem_winner"
    | "pickem_payout"
    | "pickem_streak"
    | "pickem_rank_up"
    | "pickem_achievement"
    | "platform_announcement";
  title: string;
  detail: string;
  at: string;
  href?: string;
  announcementId?: string;
}

export interface PlayerDashboardData {
  displayName: string;
  email: string;
  stats: PlayerDashboardStats;
  connectStatus: PlayerConnectStatus;
  connectEnabled: boolean;
  activeGames: PlayerActiveGame[];
  upcomingGames: PlayerUpcomingGame[];
  recentWins: PlayerRecentWin[];
  notifications: PlayerNotification[];
}
