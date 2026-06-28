"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import ActivityFeedPanel from "@/components/admin/commandCenter/ActivityFeedPanel";
import DashboardStatGrid from "@/components/admin/commandCenter/DashboardStatGrid";
import type { CommandCenterDashboardStats } from "@/lib/platform/engines/commandCenter";
import { getDemoDashboardStats } from "@/lib/platform/engines/commandCenter/mockStats";

export default function CommandCenterDashboardPage() {
  const [stats, setStats] = useState<CommandCenterDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/command-center/stats")
      .then(async (res) => {
        const data = (await res.json()) as {
          stats?: CommandCenterDashboardStats;
          demo?: boolean;
          error?: string;
        };

        if (cancelled) return;

        if (data.stats) {
          setStats(data.stats);
          if (data.demo) {
            setError("Live stats unavailable — showing demo data.");
          }
          return;
        }

        throw new Error(data.error ?? "Failed to load stats");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load dashboard stats — showing demo data.");
        setStats(getDemoDashboardStats("Client fallback — API unreachable."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {error && <Alert variant="warning">{error}</Alert>}

      {loading ? (
        <SkeletonKpiGrid count={10} />
      ) : stats ? (
        <>
          {stats.dataGaps.length > 0 && !error && (
            <Alert variant="warning">
              Partial data — {stats.dataGaps.join(" · ")}
            </Alert>
          )}
          <DashboardStatGrid stats={stats} />
        </>
      ) : null}

      <ActivityFeedPanel />
    </div>
  );
}
