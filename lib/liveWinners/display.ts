import type { PayoutStatus } from "@/lib/types";
import type { LiveActivityType } from "@/lib/liveWinners/types";

const ACTIVITY_ICONS: Record<LiveActivityType, string> = {
  board_filled: "📋",
  board_created: "✨",
  numbers_assigned: "🔢",
  squares_purchased: "🎟️",
  kickoff_started: "🏈",
  quarter_winner: "🏆",
  payout_sent: "💸",
};

export function getActivityIcon(type: LiveActivityType): string {
  return ACTIVITY_ICONS[type];
}

export function getPayoutDisplayStatus(status: PayoutStatus): string {
  if (status === "paid") return "Paid Automatically";
  if (status === "pending") return "Payout Processing";
  return "Payout Pending";
}
