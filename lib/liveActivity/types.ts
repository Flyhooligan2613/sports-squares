export type LiveActivityCategory =
  | "winners"
  | "rewards"
  | "community"
  | "marketplace"
  | "platform";

export type LiveActivityEventType =
  | "quarter_winner"
  | "game_winner"
  | "jackpot"
  | "large_payout"
  | "square_drop"
  | "xp"
  | "tier_promotion"
  | "achievement"
  | "badge"
  | "follower"
  | "referral"
  | "pick_card"
  | "trending_pick"
  | "new_user"
  | "new_board"
  | "board_filled"
  | "game_starting"
  | "squares_remaining"
  | "players_online"
  | "paid_today"
  | "open_boards"
  | "squares_sold"
  | "payouts_processed"
  | "game_live"
  | "pickem_streak"
  | "survivor_shield";

export interface LiveActivityCelebration {
  headline: string;
  title: string;
  amount?: string;
  subtitle?: string;
}

export interface LiveActivityEvent {
  id: string;
  type: LiveActivityEventType;
  category: LiveActivityCategory;
  emoji: string;
  message: string;
  priority: number;
  isCelebration?: boolean;
  celebration?: LiveActivityCelebration;
  personalized?: boolean;
  createdAt: string;
}

export interface LiveActivityInput {
  type: LiveActivityEventType;
  category?: LiveActivityCategory;
  emoji?: string;
  message?: string;
  username?: string;
  amount?: number | string;
  amountCents?: number;
  reward?: string;
  tier?: string;
  game?: string;
  boardIndex?: number;
  priority?: number;
  personalized?: boolean;
  isCelebration?: boolean;
  celebration?: LiveActivityCelebration;
}

export type LiveActivitySource = "mock" | "rest" | "websocket" | "supabase" | "firebase";

export const LIVE_ACTIVITY_ROTATE_MS = 5000;
export const LIVE_ACTIVITY_ANIM_MS = 280;
export const LIVE_ACTIVITY_CELEBRATION_MS = 3000;

/** Pages that show the global ticker (extend as needed). */
export const LIVE_ACTIVITY_TICKER_ROUTES = ["/", "/my-games"] as const;

export function isLiveActivityTickerRoute(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  return LIVE_ACTIVITY_TICKER_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
