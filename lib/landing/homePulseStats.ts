import type { LiveWinnersCenterData } from "@/lib/liveWinners/types";

export interface HomePulseStat {
  id: string;
  emoji: string;
  value: string;
  label: string;
  live?: boolean;
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (amount >= 10_000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function buildHomePulseStats(data: LiveWinnersCenterData | null): HomePulseStat[] {
  if (!data) return [];

  const { platform, stats } = data;

  const pulse: HomePulseStat[] = [
    {
      id: "players-online",
      emoji: "🔥",
      value: formatCount(Math.max(platform.playersOnline, 0)),
      label: "Players Online",
      live: platform.playersOnline > 0,
    },
    {
      id: "games-live",
      emoji: "🏈",
      value: formatCount(Math.max(platform.gamesCurrentlyLive, 0)),
      label: "Games Live",
      live: platform.gamesCurrentlyLive > 0,
    },
    {
      id: "paid-today",
      emoji: "💰",
      value: formatMoney(Math.max(platform.prizeMoneyPaidToday, 0)),
      label: "Paid Today",
      live: platform.prizeMoneyPaidToday > 0,
    },
    {
      id: "weekly-drops",
      emoji: "🎁",
      value: formatCount(Math.max(platform.weeklyRewardDropsOpenedToday, 0)),
      label: "Weekly Reward Drops Opened",
      live: platform.weeklyRewardDropsOpenedToday > 0,
    },
    {
      id: "quarter-winners",
      emoji: "🏆",
      value: formatCount(Math.max(stats.todaysWinners, 0)),
      label: "Quarter Winners Today",
      live: stats.todaysWinners > 0,
    },
  ];

  return pulse;
}
