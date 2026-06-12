"use client";

import { useLiveStat } from "@/lib/motion/useLiveStat";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { ActionPlatformHealth } from "@/lib/actionCenter/types";

interface PlatformHealthProps {
  platform: ActionPlatformHealth;
  active: boolean;
}

function HealthStat({
  label,
  value,
  isCurrency = false,
  accent = "text-white",
  delay,
  active,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  accent?: string;
  delay: number;
  active: boolean;
}) {
  const { value: animated, glowing } = useLiveStat(value, active, {
    duration: 1000,
    delay,
  });

  return (
    <div
      className={["lwc-platform-card", glowing ? "lwc-stat-glow" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <p className={`text-xl sm:text-2xl font-bold tabular-nums ${accent}`}>
        {isCurrency ? formatCurrency(animated) : animated.toLocaleString()}
      </p>
      <p className="text-[10px] sm:text-xs mt-2 font-semibold uppercase tracking-wider text-sb-muted">
        {label}
      </p>
    </div>
  );
}

export default function PlatformHealth({ platform, active }: PlatformHealthProps) {
  const stats = [
    { label: "Players Online", value: platform.playersOnline, accent: "lwc-text-live" },
    { label: "Games Live", value: platform.gamesLive, accent: "lwc-text-live" },
    { label: "Boards Running", value: platform.boardsRunning, accent: "text-white" },
    {
      label: "Automatic Payouts Today",
      value: platform.automaticPayoutsToday,
      accent: "lwc-text-paid",
    },
    { label: "Squares Sold Today", value: platform.squaresSoldToday, accent: "text-white" },
    {
      label: "Money Awarded Today",
      value: platform.moneyAwardedToday,
      isCurrency: true,
      accent: "text-sb-gold",
    },
    {
      label: "Money Currently In Play",
      value: platform.moneyInPlay,
      isCurrency: true,
      accent: "text-sb-glow",
    },
  ];

  return (
    <section>
      <h2 className="ac-section-title">Live Platform Health</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {stats.map((stat, index) => (
          <HealthStat
            key={stat.label}
            label={stat.label}
            value={stat.value}
            isCurrency={stat.isCurrency}
            accent={stat.accent}
            delay={index * 50}
            active={active}
          />
        ))}
      </div>
    </section>
  );
}
