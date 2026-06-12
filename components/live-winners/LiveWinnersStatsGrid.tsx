"use client";

import { useCountUp } from "@/lib/motion/useCountUp";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveWinnersStats } from "@/lib/liveWinners/types";

interface LiveWinnersStatsGridProps {
  stats: LiveWinnersStats;
  active: boolean;
}

function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  accent,
  delay,
  active,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent: string;
  delay: number;
  active: boolean;
}) {
  const animated = useCountUp(value, active, { duration: 1100, delay });

  return (
    <div
      className="lwc-stat-card admin-stat-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${accent}`}>
        {prefix}
        {label.includes("Prize") ? formatCurrency(animated) : animated.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sb-muted text-xs sm:text-sm mt-2 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function LiveWinnersStatsGrid({ stats, active }: LiveWinnersStatsGridProps) {
  const cards = [
    { label: "Today's Winners", value: stats.todaysWinners, accent: "text-sb-success" },
    { label: "Today's Automatic Payouts", value: stats.todaysPayouts, accent: "text-sb-glow" },
    { label: "Boards Played", value: stats.boardsPlayed, accent: "text-white" },
    { label: "Squares Sold", value: stats.squaresSold, accent: "text-white" },
    { label: "Prize Money Awarded Today", value: stats.prizeMoneyToday, accent: "text-sb-gold" },
  ];

  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Today&apos;s Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            accent={card.accent}
            delay={index * 80}
            active={active}
          />
        ))}
      </div>
    </section>
  );
}
