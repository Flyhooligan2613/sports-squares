import type { PayoutStatus, ScoringPeriod } from "@/lib/types";
import type { LiveActivityType, LiveGameStatus } from "@/lib/liveWinners/types";

const ACTIVITY_ICONS: Record<LiveActivityType, string> = {
  board_filled: "🏈",
  board_created: "🚀",
  numbers_assigned: "🎲",
  squares_purchased: "💳",
  kickoff_started: "🏈",
  quarter_winner: "🏆",
  final_winner: "🏁",
  payout_sent: "💰",
  game_opened: "⚡",
  streak_milestone: "🔥",
};

const ACTIVITY_ACCENTS: Partial<
  Record<LiveActivityType, "green" | "blue" | "purple" | "gold" | "yellow" | "red">
> = {
  board_filled: "green",
  board_created: "purple",
  numbers_assigned: "blue",
  squares_purchased: "purple",
  kickoff_started: "red",
  quarter_winner: "gold",
  final_winner: "gold",
  payout_sent: "green",
  game_opened: "blue",
  streak_milestone: "gold",
};

export function getActivityIcon(type: LiveActivityType): string {
  return ACTIVITY_ICONS[type];
}

export function getActivityAccent(
  type: LiveActivityType
): "green" | "blue" | "purple" | "gold" | "yellow" | "red" | undefined {
  return ACTIVITY_ACCENTS[type];
}

export function getPayoutDisplayStatus(status: PayoutStatus): string {
  if (status === "paid") return "Paid Automatically";
  if (status === "pending") return "Payout Processing";
  return "Payout Pending";
}

export function getPayoutStatusClass(status: PayoutStatus): string {
  if (status === "paid") return "lwc-status-paid";
  if (status === "pending") return "lwc-status-processing";
  return "lwc-status-processing";
}

export function getGameStatusClass(status: LiveGameStatus | null): string {
  if (status === "live") return "lwc-status-live";
  if (status === "upcoming") return "lwc-status-upcoming";
  if (status === "final") return "lwc-status-winner";
  return "";
}

export function periodBadgeLabel(period: ScoringPeriod): string {
  if (period === "FINAL") return "Final Winner";
  if (period === "1H") return "Half 1 Winner";
  if (period === "2H") return "Half 2 Winner";
  return `Quarter ${period.slice(1)} Winner`;
}

export function periodShortLabel(period: ScoringPeriod): string {
  if (period === "FINAL") return "Final";
  if (period === "1H") return "Half 1";
  if (period === "2H") return "Half 2";
  return `Q${period.slice(1)}`;
}

export function periodBadgeClass(period: ScoringPeriod): string {
  if (period === "FINAL") return "lwc-period-final";
  return "lwc-period-quarter";
}
