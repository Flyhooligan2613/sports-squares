"use client";

import { useEffect, useState } from "react";
import { useLiveStat } from "@/lib/motion/useLiveStat";
import type { LiveArenaStats } from "@/lib/live-arena/types";

const STAT_ITEMS = [
  { key: "playersLive" as const, icon: "🔥", label: "Players Live" },
  { key: "paidToday" as const, icon: "💰", label: "Paid Today", prefix: "$" },
  { key: "winners" as const, icon: "🏆", label: "Winners" },
  { key: "boardsActive" as const, icon: "⚡", label: "Boards Active" },
];

interface LiveActivityBarProps {
  stats: LiveArenaStats;
  active: boolean;
}

export default function LiveActivityBar({ stats, active }: LiveActivityBarProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 8000);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      {STAT_ITEMS.map((item) => (
        <StatChip
          key={item.key}
          icon={item.icon}
          label={item.label}
          value={stats[item.key]}
          prefix={item.prefix}
          bump={tick}
        />
      ))}
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  prefix = "",
  bump,
}: {
  icon: string;
  label: string;
  value: number;
  prefix?: string;
  bump: number;
}) {
  const jitter = (bump % 3) * (label === "Paid Today" ? 120 : 7);
  const target = value + jitter;
  const { value: animated, glowing } = useLiveStat(target, true, {
    duration: 700,
  });

  return (
    <div
      className={[
        "la-stat-ticker shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px]",
        glowing ? "border-blue-400/20" : "",
      ].join(" ")}
    >
      <span aria-hidden>{icon}</span>
      <span className="tabular-nums font-semibold text-white/90">
        {prefix}
        {animated.toLocaleString()}
      </span>
      <span className="text-sb-muted hidden sm:inline">{label}</span>
    </div>
  );
}
