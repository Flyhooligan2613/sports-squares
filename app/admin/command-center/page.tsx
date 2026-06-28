"use client";

import DashboardStatGrid from "@/components/admin/commandCenter/DashboardStatGrid";
import ActivityFeedPanel from "@/components/admin/commandCenter/ActivityFeedPanel";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { CommandCenterDashboardStats } from "@/lib/platform/engines/commandCenter";
import { getDemoDashboardStats } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";

const INITIAL_STATS = getDemoDashboardStats("Demo preview — refreshing live stats…");

function parseStats(body: Record<string, unknown>) {
  if (body.stats) {
    return {
      value: body.stats as CommandCenterDashboardStats,
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function CommandCenterDashboardPage() {
  const { data: stats, hydrating, usingDemo } = useCommandCenterHydration({
    url: "/api/admin/command-center/stats",
    initialData: INITIAL_STATS,
    parse: parseStats,
  });

  const partialMessage =
    !hydrating && !usingDemo && stats.dataGaps.length > 0
      ? `Partial data — ${stats.dataGaps.join(" · ")}`
      : null;

  return (
    <div className="space-y-6">
      <CommandCenterSyncBanner
        hydrating={hydrating}
        usingDemo={usingDemo}
        partialMessage={partialMessage}
      />

      <DashboardStatGrid stats={stats} />

      <ActivityFeedPanel />
    </div>
  );
}
