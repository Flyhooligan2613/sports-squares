import type { EspnSport } from "@/lib/types";

export type HotBadge = "hot" | "trending" | "selling_fast";

export interface ActionGameBoard {
  poolId: string;
  boardIndex: number;
  squaresRemaining: number;
  squaresSold: number;
  fillPercent: number;
}

export interface ActionGameCard {
  gameId: string;
  espnGameId: string;
  sport: EspnSport;
  sportLabel: string;
  awayTeam: string;
  homeTeam: string;
  kickoffAt: string;
  status: "live" | "upcoming" | "final";
  periodLabel: string | null;
  clockLabel: string | null;
  homeScore: number | null;
  awayScore: number | null;
  openBoard: ActionGameBoard | null;
  totalSquaresSold: number;
  recentPurchases: number;
  trendingScore: number;
  hotBadge: HotBadge | null;
}

export interface NowHappeningCard extends ActionGameCard {
  featuredReason: "live" | "kickoff_soon" | "filling_fast";
  ctaLabel: string;
}

export interface CountdownGame {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  sport: EspnSport;
  kickoffAt: string;
  status: "live" | "upcoming";
  openBoardPoolId: string | null;
}

export interface FillingFastBoard {
  poolId: string;
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  sport: EspnSport;
  boardIndex: number;
  fillPercent: number;
  squaresRemaining: number;
}

export interface NextPayoutItem {
  id: string;
  periodLabel: string;
  awayTeam: string;
  homeTeam: string;
  estimatedMinutes: number | null;
  estimatedLabel: string;
  prizePool: number;
  poolId: string;
}

export interface PurchaseFeedItem {
  id: string;
  maskedName: string;
  action: "purchased" | "joined";
  squares: number;
  detail: string;
  at: string;
}

export interface SportSummary {
  sport: string;
  label: string;
  gamesToday: number;
  boardsOpen: number;
  playersWaiting: number;
  squaresRemaining: number;
  comingSoon?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  timeLabel: string;
  title: string;
  detail?: string;
  kind: "board_open" | "kickoff" | "quarter_winner" | "halftime" | "final" | "payout";
}

export interface SmartRecommendation {
  id: string;
  reason: string;
  title: string;
  detail: string;
  playUrl: string;
  ctaLabel: string;
}

export interface ActionPlatformHealth {
  playersOnline: number;
  gamesLive: number;
  boardsRunning: number;
  automaticPayoutsToday: number;
  squaresSoldToday: number;
  moneyAwardedToday: number;
  moneyInPlay: number;
}

export interface ActionCenterData {
  nowHappening: NowHappeningCard[];
  countdown: CountdownGame[];
  fillingFast: FillingFastBoard[];
  nextPayouts: NextPayoutItem[];
  hotGames: ActionGameCard[];
  purchaseFeed: PurchaseFeedItem[];
  upcomingSports: SportSummary[];
  timeline: TimelineEvent[];
  recommendations: SmartRecommendation[];
  platform: ActionPlatformHealth;
  updatedAt: string;
}
