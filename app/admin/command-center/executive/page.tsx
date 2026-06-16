"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import DashboardStatGrid from "@/components/admin/commandCenter/DashboardStatGrid";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import type { ExecutiveDashboardSummary } from "@/lib/platform/engines/commandCenter";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function ExecutiveDashboardPage() {
  const [summary, setSummary] = useState<ExecutiveDashboardSummary | null>(null);

  useEffect(() => {
    fetch("/api/admin/command-center/executive")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { summary: ExecutiveDashboardSummary };
          setSummary(data.summary);
        }
      })
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return <SkeletonKpiGrid count={6} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Executive Dashboard</h2>
        <p className="text-sm text-sb-muted mt-1">
          High-level KPIs for leadership — financial overview and triggered alerts.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Deposits Today" value={formatCents(summary.financialOverview.depositsTodayCents)} accent="success" />
        <AdminStatCard label="Withdrawals Today" value={formatCents(summary.financialOverview.withdrawalsTodayCents)} accent="muted" />
        <AdminStatCard label="Prize Pools" value={formatCents(summary.financialOverview.prizePoolCents)} accent="gold" />
        <AdminStatCard label="Growth Fund" value={formatCents(summary.financialOverview.growthFundBalanceCents)} accent="purple" />
      </div>

      <DashboardStatGrid stats={summary.stats} />

      {summary.topAlerts.length > 0 && (
        <LandingGlassCard className="p-4 sm:p-5">
          <h3 className="text-white font-semibold mb-3">Active Alerts</h3>
          <ul className="space-y-2 text-sm">
            {summary.topAlerts.map((alert) => (
              <li key={alert.id} className="text-amber-400">
                {alert.title} — {alert.message}
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      )}
    </div>
  );
}
