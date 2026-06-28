"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { CommandCenterAlert } from "@/lib/platform/engines/commandCenter";
import { getDemoAlerts } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";

const SEVERITY_CLASS: Record<string, string> = {
  info: "text-sb-muted border-white/10",
  warning: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  critical: "text-red-400 border-red-500/30 bg-red-500/5",
};

function parseAlerts(body: Record<string, unknown>) {
  if (Array.isArray(body.alerts)) {
    return {
      value: body.alerts as CommandCenterAlert[],
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function AlertCenterPage() {
  const {
    data: alerts,
    setData: setAlerts,
    hydrating,
    usingDemo,
  } = useCommandCenterHydration({
    url: "/api/admin/command-center/alerts",
    initialData: getDemoAlerts(),
    parse: parseAlerts,
  });

  async function toggleAlert(id: string, enabled: boolean) {
    const res = await fetch("/api/admin/command-center/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    if (res.ok) {
      const data = (await res.json()) as { alert: CommandCenterAlert };
      setAlerts((prev) => prev.map((a) => (a.id === id ? data.alert : a)));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Alert Center</h2>
        <p className="text-sm text-sb-muted mt-1">
          Configurable alerts with severity thresholds — migration 053 seeds defaults.
        </p>
      </div>

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

      {alerts.length === 0 ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted text-sm">
          No alerts configured. Apply migration 053.
        </LandingGlassCard>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <LandingGlassCard
              key={alert.id}
              className={`p-4 border ${SEVERITY_CLASS[alert.severity] ?? SEVERITY_CLASS.info}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{alert.title}</h3>
                    {alert.triggered && (
                      <span className="text-[10px] uppercase font-bold text-red-400">Triggered</span>
                    )}
                  </div>
                  <p className="text-sm text-sb-muted">{alert.message}</p>
                  <p className="text-xs text-sb-muted mt-2">
                    {alert.category} · {alert.severity} · key: {alert.alertKey}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-sb-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={(e) => toggleAlert(alert.id, e.target.checked)}
                    className="rounded border-white/20"
                  />
                  Enabled
                </label>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
