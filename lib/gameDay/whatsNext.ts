import type { GameDayWhatsNextItem } from "@/lib/gameDay/types";

export interface WhatsNextContext {
  activeSquares: number;
  upcomingGames: number;
  survivorPickWaiting: boolean;
  weeklyDropAvailable: boolean;
  pickemRemaining: number;
  pickemEntered: boolean;
  tierProgressPct: number;
  creditsToNextTier: number;
  liveGamesCount: number;
  recentWinToday: boolean;
  eliminatedFromSurvivor: boolean;
}

export function buildWhatsNext(ctx: WhatsNextContext): GameDayWhatsNextItem[] {
  const items: GameDayWhatsNextItem[] = [];

  if (ctx.survivorPickWaiting) {
    items.push({
      id: "survivor_pick",
      emoji: "🛡️",
      title: "Lock your Survivor pick",
      reason: "Your season stays alive with one confident choice.",
      href: "/survivor",
      priority: 100,
    });
  }

  if (ctx.weeklyDropAvailable) {
    items.push({
      id: "reward_drop",
      emoji: "🎁",
      title: "Open your Reward Drop",
      reason: "Something good is waiting — don't let it expire.",
      href: "/my-games/rewards/square-drop",
      priority: 95,
    });
  }

  if (ctx.pickemEntered && ctx.pickemRemaining > 0) {
    items.push({
      id: "finish_pickem",
      emoji: "🏈",
      title: "Finish your Pick'em card",
      reason: `${ctx.pickemRemaining} pick${ctx.pickemRemaining === 1 ? "" : "s"} still open before lock.`,
      href: "/pickem",
      priority: 90,
    });
  }

  if (!ctx.pickemEntered && ctx.liveGamesCount > 0) {
    items.push({
      id: "join_pickem",
      emoji: "📊",
      title: "Try this week's Pick'em",
      reason: "Players are submitting cards — jump in before kickoff.",
      href: "/pickem",
      priority: 85,
    });
  }

  if (ctx.activeSquares === 0 && ctx.upcomingGames === 0) {
    items.push({
      id: "join_board",
      emoji: "📋",
      title: "Join a board filling fast",
      reason: "Squares are moving — grab yours before they're gone.",
      href: "/action-center",
      priority: 80,
    });
  }

  if (ctx.creditsToNextTier > 0 && ctx.creditsToNextTier <= 50) {
    items.push({
      id: "tier_push",
      emoji: "⭐",
      title: "You're one win away from the next tier",
      reason: `Only ${ctx.creditsToNextTier} credits to level up.`,
      href: "/my-games/rewards/tier",
      priority: 75,
    });
  }

  if (ctx.recentWinToday) {
    items.push({
      id: "celebrate",
      emoji: "🎉",
      title: "Share your win with The Huddle",
      reason: "Let the community celebrate with you.",
      href: "/huddle",
      priority: 70,
    });
  }

  if (ctx.eliminatedFromSurvivor) {
    items.push({
      id: "survivor_alt",
      emoji: "🔄",
      title: "Jump into Double Life or a private league",
      reason: "Your season isn't over — alternative paths are open.",
      href: "/survivor/leagues",
      priority: 65,
    });
  }

  if (ctx.activeSquares > 0 && ctx.liveGamesCount > 0) {
    items.push({
      id: "watch_live",
      emoji: "📺",
      title: "Watch your boards on Live TV",
      reason: "Your squares are in play right now.",
      href: "/live-tv",
      priority: 60,
    });
  }

  items.push({
    id: "explore_winners",
    emoji: "🏆",
    title: "See who's winning today",
    reason: "Live winners, streaks, and community momentum.",
    href: "/live-winners",
    priority: 40,
  });

  return items.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
