"use client";

import { useMemo } from "react";
import type { GeoState } from "@/lib/operations/geo-compliance/types";

interface DistributionHeatmapsProps {
  states: GeoState[];
  selectedId?: string | null;
}

type MetricKey =
  | "registeredPlayers"
  | "revenue"
  | "deposits"
  | "avgContestSize"
  | "referralActivity"
  | "growthTrend";

const METRICS: Array<{ key: MetricKey; label: string; format: (v: number) => string }> = [
  { key: "registeredPlayers", label: "Players by State", format: (v) => v.toLocaleString() },
  { key: "revenue", label: "Revenue by State", format: (v) => `$${(v / 1000).toFixed(0)}K` },
  {
    key: "deposits",
    label: "Deposits by State",
    format: (v) => `$${(v / 1000).toFixed(0)}K`,
  },
  {
    key: "avgContestSize",
    label: "Average Contest Size",
    format: (v) => `${v} entries`,
  },
  {
    key: "referralActivity",
    label: "Referral Activity",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "growthTrend",
    label: "Growth Trends",
    format: (v) => `${v >= 0 ? "+" : ""}${v}%`,
  },
];

function getMetricValue(state: GeoState, key: MetricKey): number {
  switch (key) {
    case "deposits":
      return state.distribution.deposits;
    case "avgContestSize":
      return state.distribution.avgContestSize;
    case "referralActivity":
      return state.distribution.referralActivity;
    case "growthTrend":
      return state.distribution.growthTrend;
    default:
      return state[key];
  }
}

export default function DistributionHeatmaps({
  states,
  selectedId = null,
}: DistributionHeatmapsProps) {
  const topStates = useMemo(
    () => [...states].sort((a, b) => b.registeredPlayers - a.registeredPlayers).slice(0, 12),
    [states],
  );

  return (
    <section className="geo-section" aria-labelledby="geo-distribution-heading">
      <header className="geo-section-header">
        <div>
          <h2 id="geo-distribution-heading" className="geo-section-title">
            Player Distribution
          </h2>
          <p className="geo-section-subtitle">Top jurisdictions — mock heat visualization</p>
        </div>
      </header>

      <div className="geo-heatmap-grid">
        {METRICS.map((metric) => {
          const max = Math.max(
            ...topStates.map((s) => getMetricValue(s, metric.key)),
            1,
          );
          return (
            <article key={metric.key} className="geo-heatmap-card ops-glass-card">
              <h3 className="geo-heatmap-title">{metric.label}</h3>
              <ul className="geo-heatmap-bars">
                {topStates.map((state) => {
                  const value = getMetricValue(state, metric.key);
                  const pct = Math.max(4, (Math.abs(value) / max) * 100);
                  const isSelected = selectedId === state.id;
                  return (
                    <li
                      key={state.id}
                      className={`geo-heatmap-row ${isSelected ? "geo-heatmap-row-selected" : ""}`}
                    >
                      <span className="geo-heatmap-state">{state.id}</span>
                      <div className="geo-heatmap-bar-track">
                        <div
                          className={`geo-heatmap-bar geo-heatmap-bar-${metric.key === "growthTrend" && value < 0 ? "negative" : "positive"}`}
                          style={{ width: `${pct}%` }}
                          role="presentation"
                        />
                      </div>
                      <span className="geo-heatmap-value">{metric.format(value)}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
