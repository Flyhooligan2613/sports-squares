import type { GameDaySnapshotCard } from "@/lib/gameDay/types";

export interface SnapshotContext {
  pickemRemaining: number;
  pickemEntered: boolean;
  survivorPickWaiting: boolean;
  weeklyDropAvailable: boolean;
  highlightSquares: number;
  activeSquares: number;
  upcomingGames: number;
  tierProgressPct: number;
  creditsToNextTier: number;
  liveGamesCount: number;
}

export function buildSnapshotCards(ctx: SnapshotContext): GameDaySnapshotCard[] {
  const cards: GameDaySnapshotCard[] = [];

  if (ctx.pickemEntered && ctx.pickemRemaining > 0) {
    cards.push({
      id: "pickem",
      emoji: "🎯",
      title: "Complete today's Pick'em",
      subtitle: `${ctx.pickemRemaining} pick${ctx.pickemRemaining === 1 ? "" : "s"} left`,
      href: "/pickem",
      highlight: true,
    });
  } else if (!ctx.pickemEntered) {
    cards.push({
      id: "pickem",
      emoji: "🎯",
      title: "Complete today's Pick'em",
      subtitle: "Submit your card before lock",
      href: "/pickem",
    });
  }

  if (ctx.activeSquares === 0 && ctx.upcomingGames === 0) {
    cards.push({
      id: "boards",
      emoji: "🏈",
      title: "Join today's Square Boards",
      subtitle: "Squares are filling fast",
      href: "/action-center",
      highlight: ctx.liveGamesCount > 0,
    });
  } else {
    cards.push({
      id: "boards",
      emoji: "🏈",
      title: "Join today's Square Boards",
      subtitle:
        ctx.activeSquares > 0
          ? `${ctx.activeSquares} active square${ctx.activeSquares === 1 ? "" : "s"}`
          : `${ctx.upcomingGames} upcoming game${ctx.upcomingGames === 1 ? "" : "s"}`,
      href: "/action-center",
    });
  }

  if (ctx.survivorPickWaiting) {
    cards.push({
      id: "survivor",
      emoji: "🛡️",
      title: "Lock Survivor Pick",
      subtitle: "Your season stays alive with one choice",
      href: "/survivor",
      highlight: true,
    });
  }

  if (ctx.weeklyDropAvailable) {
    cards.push({
      id: "drop",
      emoji: "🎁",
      title: "Open Weekly Reward Drop",
      subtitle: "Something good is waiting",
      href: "/my-games/rewards/square-drop",
      highlight: true,
    });
  }

  if (ctx.highlightSquares > 0) {
    cards.push({
      id: "highlights",
      emoji: "⭐",
      title: "Check Highlight Squares",
      subtitle: `${ctx.highlightSquares} active on your boards`,
      href: "/live-winners",
    });
  }

  cards.push({
    id: "huddle",
    emoji: "👥",
    title: "Visit The Huddle",
    subtitle: "Community picks and momentum",
    href: "/huddle",
  });

  cards.push({
    id: "legacy",
    emoji: "📈",
    title: "View Legacy Progress",
    subtitle: "Your story on SquareBoards",
    href: "/my-games/profile",
  });

  if (ctx.creditsToNextTier > 0 && ctx.creditsToNextTier <= 75) {
    cards.push({
      id: "tier",
      emoji: "🏆",
      title: "Continue Tier Progress",
      subtitle: `${ctx.creditsToNextTier} credits to level up`,
      href: "/my-games/rewards/tier",
      highlight: ctx.creditsToNextTier <= 50,
    });
  } else {
    cards.push({
      id: "tier",
      emoji: "🏆",
      title: "Continue Tier Progress",
      subtitle: `${ctx.tierProgressPct}% toward next tier`,
      href: "/my-games/rewards/tier",
    });
  }

  return cards.slice(0, 8);
}
