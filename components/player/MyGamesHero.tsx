"use client";

import { DollarSign, LayoutGrid, Trophy, CalendarDays } from "lucide-react";
import { useCountUp } from "@/lib/motion/useCountUp";
import type { PlayerDashboardStats } from "@/lib/player/dashboardTypes";

interface MyGamesHeroProps {
  displayName: string;
  stats: PlayerDashboardStats;
}

function StatTile({
  label,
  value,
  prefix = "",
  suffix = "",
  accent,
  delay,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent: string;
  delay: number;
}) {
  const animated = useCountUp(value, true, { duration: 1100, delay });

  return (
    <div
      className="player-stat-tile admin-stat-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums ${accent}`}>
        {prefix}
        {animated.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sb-muted text-xs sm:text-sm mt-2 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function MyGamesHero({ displayName, stats }: MyGamesHeroProps) {
  const activeLabel =
    stats.activeBoards === 1
      ? "You have 1 active board."
      : `You have ${stats.activeBoards} active boards.`;

  return (
    <section className="player-hero relative overflow-hidden">
      <div className="player-hero-glow" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
        <p className="text-sb-glow text-sm font-semibold uppercase tracking-[0.2em] mb-3 player-hero-enter">
          Player Dashboard
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-3 player-hero-enter player-hero-enter-1">
          Welcome back, {displayName}
        </h1>
        <p className="text-lg sm:text-xl text-sb-muted mb-10 player-hero-enter player-hero-enter-2">
          {activeLabel}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatTile
            label="Total Winnings"
            value={stats.totalWinnings}
            prefix="$"
            accent="text-sb-gold"
            delay={80}
          />
          <StatTile
            label="Lifetime Wins"
            value={stats.lifetimeWins}
            accent="text-sb-success"
            delay={160}
          />
          <StatTile
            label="Active Boards"
            value={stats.activeBoards}
            accent="text-sb-glow"
            delay={240}
          />
          <StatTile
            label="Upcoming Games"
            value={stats.upcomingGames}
            accent="text-white"
            delay={320}
          />
        </div>
      </div>
    </section>
  );
}

export function MyGamesHeroIcons() {
  return {
    winnings: DollarSign,
    wins: Trophy,
    boards: LayoutGrid,
    upcoming: CalendarDays,
  };
}
