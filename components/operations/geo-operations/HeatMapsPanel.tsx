"use client";

import { useMemo } from "react";
import { GlassPanel } from "@/design-system";
import type { GeoOperationsState } from "@/lib/operations/geo-operations/types";
import type { HeatmapMetricKey } from "@/lib/operations/geo-operations/types";

interface HeatMapsPanelProps {
  states: GeoOperationsState[];
  selectedId?: string | null;
}

const METRICS: Array<{ key: HeatmapMetricKey; label: string; format: (v: number) => string }> = [
  { key: "playerDensity", label: "Player Density", format: (v) => v.toLocaleString() },
  { key: "revenueDensity", label: "Revenue Density", format: (v) => `$${(v / 1000).toFixed(0)}K` },
  { key: "contestActivity", label: "Contest Activity", format: (v) => v.toLocaleString() },
  { key: "waitlistGrowth", label: "Waitlist Growth", format: (v) => v.toLocaleString() },
  { key: "referralActivity", label: "Referral Activity", format: (v) => v.toLocaleString() },
  { key: "growthTrend", label: "Growth Trends", format: (v) => `${v >= 0 ? "+" : ""}${v}%` },
];

function getMetricValue(state: GeoOperationsState, key: HeatmapMetricKey): number {
  switch (key) {
    case "playerDensity":
      return state.registeredPlayers;
    case "revenueDensity":
      return state.revenue;
    case "contestActivity":
      return state.openBoards + state.completedBoards;
    case "waitlistGrowth":
      return state.waitlist?.currentWaitlist ?? 0;
    case "referralActivity":
      return state.distribution.referralActivity;
    case "growthTrend":
      return state.distribution.growthTrend;
    default:
      return 0;
  }
}

export default function HeatMapsPanel({ states, selectedId = null }: HeatMapsPanelProps) {
  const topStates = useMemo(
    () => [...states].sort((a, b) => b.registeredPlayers - a.registeredPlayers).slice(0, 12),
    [states],
  );

  return (
    <section className="geo-section" aria-labelledby="geo-ops-heatmap-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-ops-heatmap-heading" className="geo-section-title">
            Heat Maps
          </h2>
          <p className="geo-section-subtitle">
            Player density, revenue, contests, waitlist, referrals, and growth — mock visualization
          </p>
        </div>
      </header>

      <div className="geo-heatmap-grid">
        {METRICS.map((metric) => {
          const max = Math.max(
            ...topStates.map((s) => Math.abs(getMetricValue(s, metric.key))),
            1,
          );
          return (
            <GlassPanel key={metric.key} padding="sm" className="geo-heatmap-card">
              <h3 className="geo-heatmap-title">{metric.label}</h3>
              <ul className="geo-heatmap-bars">
                {topStates.map((state) => {
                  const value = getMetricValue(state, metric.key);
                  const pct = Math.max(4, (Math.abs(value) / max) * 100);
                  const isSelected = selectedId === state.id;
                  const isNegative = metric.key === "growthTrend" && value < 0;
                  return (
                    <li
                      key={state.id}
                      className={`geo-heatmap-row ${isSelected ? "geo-heatmap-row-selected" : ""}`}
                    >
                      <span className="geo-heatmap-state">{state.id}</span>
                      <div className="geo-heatmap-bar-track">
                        <div
                          className={`geo-heatmap-bar ${isNegative ? "geo-heatmap-bar-negative" : "geo-heatmap-bar-positive"}`}
                          style={{ width: `${pct}%` }}
                          role="presentation"
                        />
                      </div>
                      <span className="geo-heatmap-value">{metric.format(value)}</span>
                    </li>
                  );
                })}
              </ul>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}
