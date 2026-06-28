"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import DashboardStatGrid from "@/components/admin/commandCenter/DashboardStatGrid";
import AdminStatCard from "@/components/admin/AdminStatCard";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { ExecutiveDashboardSummary } from "@/lib/platform/engines/commandCenter";
import { getDemoExecutiveSummary } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function parseExecutive(body: Record<string, unknown>) {
  if (body.summary) {
    return {
      value: body.summary as ExecutiveDashboardSummary,
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function ExecutiveDashboardPage() {
  const { data: summary, hydrating, usingDemo } = useCommandCenterHydration({
    url: "/api/admin/command-center/executive",
    initialData: getDemoExecutiveSummary(),
    parse: parseExecutive,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Executive Dashboard</h2>
        <p className="text-sm text-sb-muted mt-1">
          High-level KPIs for leadership — financial overview and triggered alerts.
        </p>
      </div>

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

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
