"use client";

import {
  Activity,
  AlertTriangle,
  CreditCard,
  Headphones,
  ShieldAlert,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { GlassPanel } from "@/design-system";
import { MOCK_LIVE_OPS } from "@/lib/operations/geo-operations";

const METRICS = [
  { key: "playersOnline" as const, label: "Players Online", icon: Users, format: (v: number) => v.toLocaleString() },
  { key: "liveBoards" as const, label: "Live Boards", icon: Trophy, format: (v: number) => v.toLocaleString() },
  { key: "depositsToday" as const, label: "Deposits", icon: CreditCard, format: (v: number) => `$${(v / 1000).toFixed(0)}K` },
  { key: "withdrawalsToday" as const, label: "Withdrawals", icon: Wallet, format: (v: number) => `$${(v / 1000).toFixed(0)}K` },
  { key: "verificationQueue" as const, label: "Verification Queue", icon: Activity, format: (v: number) => v.toLocaleString() },
  { key: "supportQueue" as const, label: "Support Queue", icon: Headphones, format: (v: number) => v.toLocaleString() },
  { key: "complianceAlerts" as const, label: "Compliance Alerts", icon: AlertTriangle, format: (v: number) => v.toLocaleString() },
  { key: "riskAlerts" as const, label: "Risk Alerts", icon: ShieldAlert, format: (v: number) => v.toLocaleString() },
];

export default function LiveOperationsPanel() {
  return (
    <section className="geo-ops-live" aria-labelledby="geo-ops-live-heading">
      <header className="geo-ops-live-header">
        <span className="geo-health-pulse" aria-hidden="true" />
        <h2 id="geo-ops-live-heading" className="geo-ops-live-title">
          Live Operations
        </h2>
      </header>
      <div className="geo-ops-live-grid">
        {METRICS.map((metric, i) => {
          const Icon = metric.icon;
          const value = MOCK_LIVE_OPS[metric.key];
          return (
            <GlassPanel
              key={metric.key}
              padding="sm"
              className="geo-ops-live-card"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <Icon className="geo-ops-live-icon" strokeWidth={1.75} aria-hidden="true" />
              <span className="geo-ops-live-value">{metric.format(value)}</span>
              <span className="geo-ops-live-label">{metric.label}</span>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}
