"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Crown,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { MOCK_GEO_STATES } from "@/lib/operations/geo-compliance/mockStates";
import { MOCK_COMPLIANCE_ALERTS } from "@/lib/operations/geo-compliance/mockAlerts";

const INSIGHT_SECTIONS = [
  {
    id: "growing",
    label: "Top Growing States",
    icon: TrendingUp,
    accent: "success" as const,
    getData: () =>
      [...MOCK_GEO_STATES]
        .filter((s) => s.status === "live")
        .sort((a, b) => b.distribution.growthTrend - a.distribution.growthTrend)
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, value: `+${s.distribution.growthTrend}%` })),
  },
  {
    id: "revenue",
    label: "Fastest Revenue Growth",
    icon: ArrowUpRight,
    accent: "blue" as const,
    getData: () =>
      [...MOCK_GEO_STATES]
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
    id: "retention",
    label: "Highest Retention",
    icon: Crown,
    accent: "purple" as const,
    getData: () =>
      [
        { id: "NY", name: "New York", value: "78%" },
        { id: "FL", name: "Florida", value: "74%" },
        { id: "TX", name: "Texas", value: "71%" },
        { id: "IL", name: "Illinois", value: "69%" },
        { id: "OH", name: "Ohio", value: "67%" },
      ],
  },
  {
    id: "conversion",
    label: "Highest Conversion",
    icon: MapPin,
    accent: "success" as const,
    getData: () =>
      [
        { id: "FL", name: "Florida", value: "42%" },
        { id: "NY", name: "New York", value: "38%" },
        { id: "TX", name: "Texas", value: "36%" },
        { id: "GA", name: "Georgia", value: "34%" },
        { id: "NC", name: "North Carolina", value: "33%" },
      ],
  },
  {
    id: "attention",
    label: "States Requiring Attention",
    icon: ShieldAlert,
    accent: "warning" as const,
    getData: () =>
      MOCK_GEO_STATES.filter(
        (s) => s.status !== "live" || s.complianceAlerts > 1,
      )
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: s.status === "live" ? `${s.complianceAlerts} alerts` : s.status.replace("_", " "),
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
  {
    id: "expansion",
    label: "Suggested Expansion Opportunities",
    icon: ArrowUpRight,
    accent: "blue" as const,
    getData: () =>
      [...MOCK_GEO_STATES]
        .filter((s) => s.waitlist && s.waitlist.interestScore >= 70)
        .sort((a, b) => (b.waitlist?.interestScore ?? 0) - (a.waitlist?.interestScore ?? 0))
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          name: s.name,
          value: `Score ${s.waitlist?.interestScore}`,
        })),
  },
];

export default function FounderGeoInsights() {
  return (
    <section className="geo-founder-section" aria-labelledby="geo-founder-heading">
      <header className="geo-founder-header">
        <Crown className="geo-founder-crown" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <h2 id="geo-founder-heading" className="geo-section-title">
            Founder View
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
            <article
              key={section.id}
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
