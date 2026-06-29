"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Crown,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { GlassPanel } from "@/design-system";
import { MOCK_GEO_OPS_STATES } from "@/lib/operations/geo-operations/mockStates";
import { MOCK_COMPLIANCE_ALERTS } from "@/lib/operations/geo-operations";
import { MOCK_EXPANSION_SCORES } from "@/lib/operations/geo-operations/mockExpansion";

const INSIGHT_SECTIONS = [
  {
    id: "top-performing",
    label: "Top Performing",
    icon: Crown,
    accent: "success" as const,
    getData: () =>
      [...MOCK_GEO_OPS_STATES]
        .filter((s) => s.status === "live")
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: `$${(s.revenue / 1_000_000).toFixed(1)}M`,
        })),
  },
  {
    id: "fastest-growing",
    label: "Fastest Growing",
    icon: TrendingUp,
    accent: "success" as const,
    getData: () =>
      [...MOCK_GEO_OPS_STATES]
        .filter((s) => s.status === "live")
        .sort((a, b) => b.distribution.growthTrend - a.distribution.growthTrend)
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, value: `+${s.distribution.growthTrend}%` })),
  },
  {
    id: "attention",
    label: "States Requiring Attention",
    icon: ShieldAlert,
    accent: "warning" as const,
    getData: () =>
      MOCK_GEO_OPS_STATES.filter((s) => s.status !== "live" || s.complianceAlerts > 1)
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: s.status === "live" ? `${s.complianceAlerts} alerts` : s.status.replace("_", " "),
        })),
  },
  {
    id: "waitlist",
    label: "Highest Waitlist Growth",
    icon: Users,
    accent: "blue" as const,
    getData: () =>
      [...MOCK_GEO_OPS_STATES]
        .filter((s) => s.waitlist)
        .sort((a, b) => (b.waitlist?.currentWaitlist ?? 0) - (a.waitlist?.currentWaitlist ?? 0))
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: `${(s.waitlist?.currentWaitlist ?? 0).toLocaleString()} waiting`,
        })),
  },
  {
    id: "revenue",
    label: "Highest Revenue",
    icon: ArrowUpRight,
    accent: "blue" as const,
    getData: () =>
      [...MOCK_GEO_OPS_STATES]
        .sort((a, b) => b.todayRevenue - a.todayRevenue)
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: `$${(s.todayRevenue / 1000).toFixed(1)}K today`,
        })),
  },
  {
    id: "retention",
    label: "Highest Retention",
    icon: MapPin,
    accent: "purple" as const,
    getData: () =>
      [...MOCK_GEO_OPS_STATES]
        .filter((s) => s.retention > 0)
        .sort((a, b) => b.retention - a.retention)
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, value: `${s.retention}%` })),
  },
  {
    id: "expansion",
    label: "Recommended Expansion Priorities",
    icon: ArrowUpRight,
    accent: "blue" as const,
    getData: () =>
      MOCK_EXPANSION_SCORES.slice(0, 5).map((s) => ({
        id: s.stateId,
        name: s.stateName,
        value: `Score ${s.score}/100`,
      })),
  },
  {
    id: "warnings",
    label: "Compliance Warnings",
    icon: AlertTriangle,
    accent: "danger" as const,
    getData: () =>
      MOCK_COMPLIANCE_ALERTS.filter((a) => a.severity !== "info")
        .slice(0, 5)
        .map((a) => ({
          id: a.stateId,
          name: a.stateName,
          value: a.severity,
        })),
  },
];

export default function FounderInsights() {
  return (
    <section className="geo-founder-section" aria-labelledby="geo-ops-founder-heading">
      <header className="geo-founder-header">
        <Crown className="geo-founder-crown" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <h2 id="geo-ops-founder-heading" className="geo-section-title">
            Founder Insights
          </h2>
          <p className="geo-section-subtitle">
            Strategic geo intelligence — recommendations require admin approval
          </p>
        </div>
      </header>

      <div className="geo-founder-grid">
        {INSIGHT_SECTIONS.map((section, i) => {
          const Icon = section.icon;
          const items = section.getData();
          return (
            <GlassPanel
              key={section.id}
              padding="sm"
              glow="gold"
              className={`geo-founder-card geo-founder-${section.accent}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <header className="geo-founder-card-header">
                <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                <h3>{section.label}</h3>
              </header>
              <ul className="geo-founder-list">
                {items.map((item, idx) => (
                  <li key={`${section.id}-${item.id}`}>
                    <span className="geo-founder-rank">{idx + 1}</span>
                    <span className="geo-founder-state">{item.name}</span>
                    <span className="geo-founder-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}
