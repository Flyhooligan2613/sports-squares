"use client";

import { useEffect, useRef, useState } from "react";
import type { SurvivorLiveMapStats } from "@/lib/survivor/types";

interface SurvivorLiveMapProps {
  stats: SurvivorLiveMapStats;
  weekStatus?: string;
}

export default function SurvivorLiveMap({ stats, weekStatus }: SurvivorLiveMapProps) {
  const prevEliminated = useRef(stats.eliminatedToday);
  const [elimPulse, setElimPulse] = useState(false);
  const [massElimFlash, setMassElimFlash] = useState(false);

  useEffect(() => {
    if (stats.eliminatedToday > prevEliminated.current) {
      const delta = stats.eliminatedToday - prevEliminated.current;
      setElimPulse(true);
      if (delta >= 3) setMassElimFlash(true);

      const timer = window.setTimeout(() => {
        setElimPulse(false);
        setMassElimFlash(false);
      }, 2400);

      prevEliminated.current = stats.eliminatedToday;
      return () => window.clearTimeout(timer);
    }
    prevEliminated.current = stats.eliminatedToday;
  }, [stats.eliminatedToday]);

  const isScoring = weekStatus === "scoring" || weekStatus === "locked";

  const tiles = [
    { label: "Players Remaining", value: stats.playersRemaining, accent: true, key: "remaining" },
    {
      label: "Eliminated Today",
      value: stats.eliminatedToday,
      key: "eliminated",
      pulse: elimPulse,
      warn: stats.eliminatedToday > 0,
    },
    { label: "Survived This Week", value: stats.perfectPlayersRemaining, key: "survived" },
    { label: "Survival Rate", value: `${stats.survivorRatePct}%`, key: "rate" },
    {
      label: "Most Popular Pick",
      value: stats.mostPopularPick ?? "—",
      key: "popular",
    },
    {
      label: "Shields Activated",
      value: stats.shieldsActivated,
      shield: true,
      key: "shields",
    },
    {
      label: "Upset Risk",
      value: stats.upsetRiskTeam ?? "—",
      warn: Boolean(stats.upsetRiskTeam),
      key: "upset",
    },
  ];

  return (
    <div
      className={`survivor-live-map landing-glass-card p-5 sm:p-6 mb-6 ${
        massElimFlash ? "survivor-live-map-mass-elim" : ""
      } ${isScoring ? "survivor-live-map-scoring" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          Live Survival Map
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400/90">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 ${
                isScoring ? "animate-ping" : ""
              }`}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          {isScoring ? "Games Live" : "Live"}
        </span>
      </div>
      {massElimFlash ? (
        <p className="text-xs text-center text-red-400/90 mb-3 survivor-live-map-mass-elim-label">
          Mass elimination wave — the field is thinning
        </p>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className={`rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center transition-colors ${
              tile.pulse ? "survivor-live-map-tile-pulse" : ""
            }`}
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
              } ${tile.pulse ? "survivor-live-map-value-pulse" : ""}`}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
