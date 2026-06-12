"use client";

import { useLiveStat } from "@/lib/motion/useLiveStat";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveTvMoneyStats } from "@/lib/liveTv/types";

interface MoneyCountersProps {
  money: LiveTvMoneyStats;
  active: boolean;
}

function Counter({
  label,
  value,
  isCurrency,
  accent,
  delay,
  active,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  accent: string;
  delay: number;
  active: boolean;
}) {
  const { value: animated, glowing } = useLiveStat(value, active, {
    duration: 1200,
    delay,
  });

  return (
    <div className={["livetv-money-card", glowing ? "lwc-stat-glow" : ""].filter(Boolean).join(" ")}>
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${accent}`}>
        {isCurrency ? formatCurrency(animated) : animated.toLocaleString()}
      </p>
      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-sb-muted mt-2 font-semibold">
        {label}
      </p>
    </div>
  );
}

export default function MoneyCounters({ money, active }: MoneyCountersProps) {
  const stats = [
    {
      label: "Prize Money Paid Today",
      value: money.prizeMoneyPaidToday,
      isCurrency: true,
      accent: "text-sb-gold",
    },
    {
      label: "Squares Sold Today",
      value: money.squaresSoldValueToday,
      isCurrency: true,
      accent: "text-white",
    },
    {
      label: "Current Prize Pools",
      value: money.currentPrizePools,
      isCurrency: true,
      accent: "text-sb-glow",
    },
    {
      label: "Automatic Payouts",
      value: money.automaticPayoutsToday,
      accent: "lwc-text-paid",
    },
  ];

  return (
    <section>
      <h2 className="livetv-section-title">Live Money Counter</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Counter
            key={stat.label}
            label={stat.label}
            value={stat.value}
            isCurrency={stat.isCurrency}
            accent={stat.accent}
            delay={index * 70}
            active={active}
          />
        ))}
      </div>
    </section>
  );
}
