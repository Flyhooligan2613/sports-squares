"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { ChampionEntry } from "@/lib/liveWinners/types";

type Period = "today" | "week" | "month";

interface HallOfChampionsProps {
  champions: {
    today: ChampionEntry[];
    week: ChampionEntry[];
    month: ChampionEntry[];
  };
}

const TABS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

export default function HallOfChampions({ champions }: HallOfChampionsProps) {
  const [period, setPeriod] = useState<Period>("today");
  const entries = champions[period];

  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Hall of Champions</h2>

      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={[
              "lwc-champion-tab",
              period === tab.id ? "lwc-champion-tab-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <LandingGlassCard glow className="p-4 sm:p-5">
        {entries.length === 0 ? (
          <p className="text-sb-muted text-sm text-center py-6">
            Champions will appear as prizes are awarded.
          </p>
        ) : (
          <ol className="space-y-3">
            {entries.map((entry, index) => (
              <li
                key={`${period}-${entry.maskedName}-${index}`}
                className="lwc-champion-row admin-stat-enter"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="lwc-champion-rank">{index + 1}</span>
                <span className="text-white font-semibold flex-1">{entry.maskedName}</span>
                <span className="text-sb-gold font-bold tabular-nums">
                  {formatCurrency(entry.totalWon)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </LandingGlassCard>
    </section>
  );
}
