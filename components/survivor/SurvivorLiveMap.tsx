"use client";

import type { SurvivorLiveMapStats } from "@/lib/survivor/types";

export default function SurvivorLiveMap({ stats }: { stats: SurvivorLiveMapStats }) {
  const tiles = [
    { label: "Players Remaining", value: stats.playersRemaining, accent: true },
    { label: "Eliminated Today", value: stats.eliminatedToday },
    { label: "Survived This Week", value: stats.perfectPlayersRemaining },
    { label: "Survival Rate", value: `${stats.survivorRatePct}%` },
    {
      label: "Most Popular Pick",
      value: stats.mostPopularPick ?? "—",
    },
    {
      label: "Shields Activated",
      value: stats.shieldsActivated,
      shield: true,
    },
    {
      label: "Upset Risk",
      value: stats.upsetRiskTeam ?? "—",
      warn: Boolean(stats.upsetRiskTeam),
    },
  ];

  return (
    <div className="survivor-live-map landing-glass-card p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          Live Survival Map
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400/90">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
              {tile.label}
            </p>
            <p
              className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
                tile.warn
                  ? "text-red-400"
                  : tile.shield
                    ? "text-violet-300"
                    : tile.accent
                      ? "text-amber-400"
                      : "text-white"
              }`}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
