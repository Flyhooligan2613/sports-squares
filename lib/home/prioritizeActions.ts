import type { GameDayContinueItem, GameDayStatusItem } from "@/lib/gameDay/types";

const CONTINUE_PRIORITY: Record<string, number> = {
  drop: 100,
  mystery: 98,
  survivor: 90,
  "nfl-live": 85,
  "mlb-live": 84,
  pickem: 80,
  highlights: 70,
  notifications: 60,
  referral: 55,
  mission: 50,
};

const STATUS_PRIORITY: Record<string, number> = {
  drop: 100,
  survivor: 95,
  boards: 90,
  pickem: 85,
  highlights: 80,
  tier: 75,
  streak: 70,
  friends: 65,
  followers: 60,
  winnings: 55,
  squares: 50,
  notifications: 45,
  achievement: 40,
};

export function prioritizeContinueItems(items: GameDayContinueItem[]): GameDayContinueItem[] {
  return [...items].sort((a, b) => {
    const scoreA = CONTINUE_PRIORITY[a.id] ?? (a.urgent ? 40 : 10);
    const scoreB = CONTINUE_PRIORITY[b.id] ?? (b.urgent ? 40 : 10);
    return scoreB - scoreA;
  });
}

export function prioritizeStatusItems(items: GameDayStatusItem[], limit = 8): GameDayStatusItem[] {
  return [...items]
    .sort((a, b) => {
      const scoreA = STATUS_PRIORITY[a.id] ?? 0;
      const scoreB = STATUS_PRIORITY[b.id] ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      return 0;
    })
    .slice(0, limit);
}

export function hasRewardDropReady(items: GameDayContinueItem[]): boolean {
  return items.some((item) => item.id === "drop" || item.id === "mystery");
}
