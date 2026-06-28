"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AdminStatCard from "@/components/admin/AdminStatCard";
import Alert from "@/components/ui/Alert";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { SystemHealthReport } from "@/lib/platform/engines/commandCenter";
import { getDemoSystemHealth } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";

function parseHealth(body: Record<string, unknown>) {
  if (body.health) {
    return {
      value: body.health as SystemHealthReport,
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function SystemHealthPage() {
  const { data: health, hydrating, usingDemo } = useCommandCenterHydration({
    url: "/api/admin/command-center/health",
    initialData: getDemoSystemHealth(),
    parse: parseHealth,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">System Health</h2>
        <p className="text-sm text-sb-muted mt-1">
          Infrastructure, PaymentEngine, webhooks, and database telemetry.
        </p>
      </div>

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

      {health.alerts.map((alert) => (
        <Alert key={alert.key} variant={alert.severity === "critical" ? "error" : "warning"}>
          {alert.message}
        </Alert>
      ))}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard
          label="Supabase"
          value={health.supabaseReachable ? "Online" : "Offline"}
          accent={health.supabaseReachable ? "success" : "muted"}
        />
        <AdminStatCard
          label="PaymentEngine"
          value={health.paymentEngineConfigured ? "Ready" : "Config gap"}
          accent={health.paymentEngineConfigured ? "success" : "gold"}
        />
        <AdminStatCard label="Provider" value={health.paymentProvider} accent="purple" />
        <AdminStatCard label="DB Phase" value={`Phase ${health.databasePhase}`} accent="muted" />
        <AdminStatCard label="Webhooks 24h" value={health.webhookEvents24h} accent="purple" />
        <AdminStatCard label="Webhook Failures" value={health.webhookFailures24h} accent="gold" />
      </div>

      {health.tableCounts && (
        <LandingGlassCard className="p-4 sm:p-5">
          <h3 className="text-white font-semibold mb-3">Table Counts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-sb-muted">Pools</span><p className="text-white font-semibold">{health.tableCounts.pools}</p></div>
            <div><span className="text-sb-muted">Players</span><p className="text-white font-semibold">{health.tableCounts.players}</p></div>
            <div><span className="text-sb-muted">Payments</span><p className="text-white font-semibold">{health.tableCounts.paymentTransactions}</p></div>
            <div><span className="text-sb-muted">Audit Events</span><p className="text-white font-semibold">{health.tableCounts.auditEvents}</p></div>
          </div>
        </LandingGlassCard>
      )}

      <Link href="/admin/database-status" className="text-sm text-sb-glow hover:text-white">
        Full Database Status →
      </Link>
    </div>
  );
}
