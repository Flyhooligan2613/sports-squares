import type { GameDayContinueItem } from "@/lib/gameDay/types";

export interface ContinuePlayingContext {
  survivorPickWaiting: boolean;
  weeklyDropAvailable: boolean;
  notificationCount: number;
  missionsIncomplete: number;
  pendingReferrals: number;
  pickemRemaining: number;
  pickemEntered: boolean;
  unopenedMysteryBox: boolean;
  liveNflBoards: number;
  liveMlbBoards: number;
  highlightSquaresActive: number;
  hasPickemToday: boolean;
}

export function buildContinuePlaying(ctx: ContinuePlayingContext): GameDayContinueItem[] {
  const items: GameDayContinueItem[] = [];

  if (ctx.survivorPickWaiting) {
    items.push({
      id: "survivor",
      emoji: "🛡️",
      title: "Continue Survivor X™",
      detail: "Lock your pick before kickoff",
      href: "/survivor",
      urgent: true,
    });
  }

  if (ctx.weeklyDropAvailable) {
    items.push({
      id: "drop",
      emoji: "🎁",
      title: "Open Weekly Reward Drop",
      detail: "Your weekly drop is waiting",
      href: "/my-games/rewards/square-drop",
      urgent: true,
    });
  }

  if (ctx.pickemEntered && ctx.pickemRemaining > 0) {
    items.push({
      id: "pickem",
      emoji: "🏈",
      title: "Today's Pick'em Card",
      detail: `${ctx.pickemRemaining} pick${ctx.pickemRemaining === 1 ? "" : "s"} still open`,
      href: "/pickem",
      urgent: true,
    });
  } else if (ctx.hasPickemToday && !ctx.pickemEntered) {
    items.push({
      id: "pickem",
      emoji: "🏈",
      title: "Today's Pick'em Card",
      detail: "Submit your card before lock",
      href: "/pickem",
    });
  }

  if (ctx.liveNflBoards > 0) {
    items.push({
      id: "nfl-live",
      emoji: "🏈",
      title: "Live NFL Boards",
      detail: `${ctx.liveNflBoards} board${ctx.liveNflBoards === 1 ? "" : "s"} in play right now`,
      href: "/action-center",
    });
  }

  if (ctx.liveMlbBoards > 0) {
    items.push({
      id: "mlb-live",
      emoji: "⚾",
      title: "Live MLB Boards",
      detail: `${ctx.liveMlbBoards} board${ctx.liveMlbBoards === 1 ? "" : "s"} in play right now`,
      href: "/games/mlb",
    });
  }

  if (ctx.highlightSquaresActive > 0) {
    items.push({
      id: "highlights",
      emoji: "⭐",
      title: "Active Highlight Squares",
      detail: `${ctx.highlightSquaresActive} highlight${ctx.highlightSquaresActive === 1 ? "" : "s"} on your boards`,
      href: "/live-winners",
    });
  }

  if (ctx.notificationCount > 0) {
    items.push({
      id: "notifications",
      emoji: "🔔",
      title: "Community Notifications",
      detail: `${ctx.notificationCount} update${ctx.notificationCount === 1 ? "" : "s"} for you`,
      href: "/my-games/notifications",
    });
  }

  if (ctx.missionsIncomplete > 0) {
    items.push({
      id: "mission",
      emoji: "✨",
      title: "Daily Mission",
      detail: `${ctx.missionsIncomplete} mission${ctx.missionsIncomplete === 1 ? "" : "s"} still open today`,
      href: "/my-games",
    });
  }

  if (ctx.pendingReferrals > 0) {
    items.push({
      id: "referral",
      emoji: "🤝",
      title: "Pending Referral Reward",
      detail: `${ctx.pendingReferrals} referral${ctx.pendingReferrals === 1 ? "" : "s"} qualifying soon`,
      href: "/my-games/referrals",
    });
  }

  if (ctx.unopenedMysteryBox) {
    items.push({
      id: "mystery",
      emoji: "📦",
      title: "Mystery Box Ready",
      detail: "Open your weekly mystery box",
      href: "/my-games/rewards/square-drop",
    });
  }

  return items.slice(0, 8);
}
