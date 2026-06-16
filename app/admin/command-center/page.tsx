"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import ActivityFeedPanel from "@/components/admin/commandCenter/ActivityFeedPanel";
import DashboardStatGrid from "@/components/admin/commandCenter/DashboardStatGrid";
import type { CommandCenterDashboardStats } from "@/lib/platform/engines/commandCenter";

export default function CommandCenterDashboardPage() {
  const [stats, setStats] = useState<CommandCenterDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/command-center/stats")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        const data = (await res.json()) as { stats: CommandCenterDashboardStats };
        setStats(data.stats);
      })
      .catch(() => setError("Could not load dashboard stats."));
  }, []);

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      {!stats ? (
        <SkeletonKpiGrid count={10} />
      ) : (
        <>
          {stats.dataGaps.length > 0 && (
            <Alert variant="warning">
              Partial data — {stats.dataGaps.join(" · ")}
            </Alert>
          )}
          <DashboardStatGrid stats={stats} />
        </>
      )}

      <ActivityFeedPanel />
    </div>
  );
}
