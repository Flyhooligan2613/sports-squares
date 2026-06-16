"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { CommandCenterDashboardStats } from "@/lib/platform/engines/commandCenter";

export default function AnalyticsCharts() {
  const [stats, setStats] = useState<CommandCenterDashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/command-center/stats")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { stats: CommandCenterDashboardStats };
          setStats(data.stats);
        }
      })
      .catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  const bars = [
    { label: "Deposits", value: stats.depositsTodayCents / 100 },
    { label: "Withdrawals", value: stats.withdrawalsTodayCents / 100 },
    { label: "Prize Pool", value: stats.prizePoolCents / 100 },
    { label: "Registrations", value: stats.newRegistrationsToday },
    { label: "Champions", value: stats.championsToday },
  ];
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <LandingGlassCard className="p-4 sm:p-5">
      <h3 className="text-white font-semibold mb-4">Today at a Glance</h3>
      <div className="flex items-end gap-3 h-40">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-sb-purple/40 to-sb-glow/60 transition-all duration-700"
              style={{ height: `${Math.max(8, (bar.value / max) * 100)}%` }}
            />
            <span className="text-[10px] text-sb-muted text-center">{bar.label}</span>
          </div>
        ))}
      </div>
    </LandingGlassCard>
  );
}
