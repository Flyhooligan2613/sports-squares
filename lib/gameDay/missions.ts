import type { GameDayMission } from "@/lib/gameDay/types";

export interface GameDayMissionContext {
  activeSquares: number;
  pickemCardsSubmitted: number;
  pickemCardsTotal: number;
  survivorPickWaiting: boolean;
  weeklyDropAvailable: boolean;
  followingCount: number;
  hasJoinedBoardToday: boolean;
  xpEarnedToday: number;
}

export function buildGameDayMissions(ctx: GameDayMissionContext): GameDayMission[] {
  const pickemDone =
    ctx.pickemCardsTotal > 0 && ctx.pickemCardsSubmitted >= ctx.pickemCardsTotal;

  return [
    {
      id: "join_board",
      emoji: "📋",
      title: "Join A Board",
      description: "Claim squares before kickoff.",
      rewardLabel: "+25 XP",
      href: "/action-center",
      completed: ctx.activeSquares > 0 || ctx.hasJoinedBoardToday,
    },
    {
      id: "submit_pickem",
      emoji: "🏈",
      title: "Submit A Pick'em Card",
      description: "Lock in your weekly picks.",
      rewardLabel: "+50 Tier Credits",
      href: "/pickem",
      completed: pickemDone,
      progress:
        ctx.pickemCardsTotal > 0
          ? {
              current: ctx.pickemCardsSubmitted,
              target: ctx.pickemCardsTotal,
            }
          : undefined,
    },
    {
      id: "open_drop",
      emoji: "🎁",
      title: "Open A Reward Drop",
      description: "Your weekly drop may be ready.",
      rewardLabel: "Mystery Rewards",
      href: "/my-games/rewards/square-drop",
      completed: !ctx.weeklyDropAvailable,
    },
    {
      id: "survivor_pick",
      emoji: "🛡️",
      title: "Lock Survivor X™ Pick",
      description: "One pick keeps your season alive.",
      rewardLabel: "+8 Credits",
      href: "/survivor",
      completed: !ctx.survivorPickWaiting,
    },
    {
      id: "follow_player",
      emoji: "👥",
      title: "Follow A Player",
      description: "See what friends are playing today.",
      rewardLabel: "Community XP",
      href: "/huddle",
      completed: ctx.followingCount > 0,
    },
    {
      id: "earn_xp",
      emoji: "⭐",
      title: "Earn XP Today",
      description: "Play any game mode to build momentum.",
      rewardLabel: "Tier Progress",
      href: "/my-games/rewards/tier",
      completed: ctx.xpEarnedToday > 0,
      progress: { current: Math.min(ctx.xpEarnedToday, 100), target: 100 },
    },
  ];
}
