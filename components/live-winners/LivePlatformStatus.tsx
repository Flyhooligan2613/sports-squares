"use client";

import { useLiveStat } from "@/lib/motion/useLiveStat";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LivePlatformStatus } from "@/lib/liveWinners/types";

interface LivePlatformStatusProps {
  platform: LivePlatformStatus;
  active: boolean;
}

function StatusCard({
  label,
  value,
  isCurrency = false,
  accent = "text-white",
  delay,
  active,
  glow = false,
  prefix,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  accent?: string;
  delay: number;
  active: boolean;
  glow?: boolean;
  prefix?: string;
}) {
  const { value: animated, glowing } = useLiveStat(value, active, {
    duration: 1000,
    delay,
  });

  return (
    <div
      className={[
        "lwc-platform-card admin-stat-enter",
        glowing || glow ? "lwc-stat-glow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {prefix ? (
        <p className={`text-lg sm:text-xl font-bold ${accent}`}>{prefix}</p>
      ) : (
        <p className={`text-xl sm:text-2xl font-bold tabular-nums ${accent}`}>
          {isCurrency ? formatCurrency(animated) : animated.toLocaleString()}
        </p>
      )}
      <p className="text-sb-muted text-[10px] sm:text-xs mt-2 font-semibold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function LivePlatformStatusSection({
  platform,
  active,
}: LivePlatformStatusProps) {
  const cards = [
    {
      label: "Active Games",
      value: platform.activeGames,
      accent: "text-sb-glow",
    },
    {
      label: "Active Boards",
      value: platform.activeBoards,
      accent: "text-white",
    },
    {
      label: "Players Online",
      value: platform.playersOnline,
      accent: "lwc-text-live",
    },
    {
      label: "Squares Purchased Today",
      value: platform.squaresPurchasedToday,
      accent: "text-white",
    },
    {
      label: "Automatic Payouts Today",
      value: platform.automaticPayoutsToday,
      accent: "lwc-text-paid",
    },
    {
      label: "Prize Money Paid Today",
      value: platform.prizeMoneyPaidToday,
      isCurrency: true,
      accent: "text-sb-gold",
    },
    {
      label: "Games Currently Live",
      value: platform.gamesCurrentlyLive,
      accent: "lwc-text-live",
    },
  ];

  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
        Live Platform Status
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatusCard
          label="Platform Online"
          value={1}
          active={active}
          delay={0}
          prefix="🟢 Online"
          accent="lwc-text-paid"
        />
        {cards.map((card, index) => (
          <StatusCard
            key={card.label}
            label={card.label}
            value={card.value}
            isCurrency={card.isCurrency}
            accent={card.accent}
            delay={(index + 1) * 60}
            active={active}
          />
        ))}
      </div>
    </section>
  );
}
