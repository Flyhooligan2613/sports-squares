import type { EspnSport, ScoringPeriod } from "@/lib/types";

export type HeroCardKind = "live" | "starting_soon" | "just_paid";
export type GameStatus = "live" | "upcoming" | "final";
export type TrendBadge = "hot" | "fast_filling" | "most_played";
export type LiveTvSoundEvent =
  | "winner"
  | "board_sold_out"
  | "kickoff"
  | "quarter_complete"
  | "payment_completed";

export interface LiveTvHeroCard {
  id: string;
  kind: HeroCardKind;
  awayTeam: string;
  homeTeam: string;
  sport: EspnSport;
  sportLabel: string;
  periodLabel?: string;
  clockLabel?: string;
  kickoffAt?: string;
  boardIndex?: number;
  prizePool?: number;
  squaresRemaining?: number;
  winnerName?: string;
  winAmount?: number;
  periodWon?: string;
  poolId?: string;
}

export interface LiveTvScoreboardGame {
  gameId: string;
  poolId: string | null;
  sport: EspnSport;
  sportLabel: string;
  awayTeam: string;
  homeTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  periodLabel: string | null;
  clockLabel: string | null;
  possession?: string | null;
  boardIndex: number | null;
  prizePool: number;
  squaresRemaining: number;
  status: GameStatus;
}

export interface LiveTvBoardSquare {
  id: number;
  claimed: boolean;
  color: string | null;
  initials: string | null;
  displayNumber: number | null;
  recentlyPurchased: boolean;
}

export interface LiveTvBoardData {
  poolId: string;
  awayTeam: string;
  homeTeam: string;
  boardIndex: number;
  topNumbers: number[] | null;
  sideNumbers: number[] | null;
  innerNumbers: number[] | null;
  squares: LiveTvBoardSquare[];
  featuredWinningSquareId: number | null;
  pastWinningSquareIds: number[];
  fillPercent: number;
  prizePool: number;
  status: string;
}

export interface LiveTvMoneyStats {
  prizeMoneyPaidToday: number;
  squaresSoldValueToday: number;
  currentPrizePools: number;
  automaticPayoutsToday: number;
}

export interface LiveTvStreamEvent {
  id: string;
  type:
    | "purchase"
    | "join"
    | "fill_milestone"
    | "board_created"
    | "sold_out"
    | "touchdown"
    | "quarter_end"
    | "numbers_assigned"
    | "board_locked"
    | "winner"
    | "payout"
    | "kickoff";
  title: string;
  detail: string;
  at: string;
  accent?: "green" | "blue" | "purple" | "gold" | "yellow" | "red";
}

export interface LiveTvTrendingGame {
  gameId: string;
  poolId: string | null;
  awayTeam: string;
  homeTeam: string;
  sport: EspnSport;
  badge: TrendBadge;
  trendingScore: number;
  fillPercent: number;
  recentPurchases: number;
}

export interface LiveTvKickoff {
  gameId: string;
  poolId: string | null;
  awayTeam: string;
  homeTeam: string;
  sport: EspnSport;
  kickoffAt: string;
  status: "live" | "upcoming";
}

export interface LiveTvSportMap {
  sport: string;
  label: string;
  games: number;
  boards: number;
  players: number;
  prizePools: number;
  comingSoon?: boolean;
}

export interface LiveTvPayoutItem {
  id: string;
  periodLabel: string;
  amount: number;
  awayTeam: string;
  homeTeam: string;
  paidAt: string;
}

export interface LiveTvBigWinner {
  id: string;
  maskedName: string;
  amount: number;
  awayTeam: string;
  homeTeam: string;
  boardIndex: number;
  paidAt: string;
}

export interface LiveTvBoardEvent {
  id: string;
  awayTeam: string;
  homeTeam: string;
  soldOutBoardIndex: number;
  newBoardIndex: number;
  at: string;
}

export interface LiveTvWinnerAnnouncement {
  id: string;
  awayTeam: string;
  homeTeam: string;
  periodLabel: string;
  maskedName: string;
  amount: number;
  paidAutomatically: boolean;
  at: string;
}

export interface LiveTvData {
  heroCards: LiveTvHeroCard[];
  scoreboard: LiveTvScoreboardGame[];
  featuredBoard: LiveTvBoardData | null;
  money: LiveTvMoneyStats;
  streamEvents: LiveTvStreamEvent[];
  trending: LiveTvTrendingGame[];
  kickoffs: LiveTvKickoff[];
  sportMap: LiveTvSportMap[];
  payouts: LiveTvPayoutItem[];
  bigWinner: LiveTvBigWinner | null;
  boardEvents: LiveTvBoardEvent[];
  sidebarFeed: LiveTvStreamEvent[];
  latestWinner: LiveTvWinnerAnnouncement | null;
  updatedAt: string;
}
