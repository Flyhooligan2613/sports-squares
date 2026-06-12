"use client";

import { useLiveStat } from "@/lib/motion/useLiveStat";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveWinnersStats } from "@/lib/liveWinners/types";

interface LiveWinnersStatsGridProps {
  stats: LiveWinnersStats;
  active: boolean;
}

function StatCard({
  label,
  value,
  accent,
  delay,
  active,
  isCurrency = false,
}: {
  label: string;
  value: number;
  accent: string;
  delay: number;
  active: boolean;
  isCurrency?: boolean;
}) {
  const { value: animated, glowing } = useLiveStat(value, active, {
    duration: 1100,
    delay,
  });

  return (
    <div
      className={[
        "lwc-stat-card admin-stat-enter",
        glowing ? "lwc-stat-glow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${accent}`}>
        {isCurrency ? formatCurrency(animated) : animated.toLocaleString()}
      </p>
      <p className="text-sb-muted text-xs sm:text-sm mt-2 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function LiveWinnersStatsGrid({ stats, active }: LiveWinnersStatsGridProps) {
  const cards = [
    { label: "Today's Winners", value: stats.todaysWinners, accent: "lwc-text-paid" },
    { label: "Automatic Payouts", value: stats.todaysPayouts, accent: "lwc-text-live" },
    { label: "Boards Played", value: stats.boardsPlayed, accent: "text-white" },
    { label: "Squares Sold", value: stats.squaresSold, accent: "text-white" },
    {
      label: "Prize Money Awarded",
      value: stats.prizeMoneyToday,
      accent: "text-sb-gold",
      isCurrency: true,
    },
  ];

  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
        Today&apos;s Statistics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            accent={card.accent}
            delay={index * 80}
            active={active}
            isCurrency={card.isCurrency}
          />
        ))}
      </div>
    </section>
  );
}
