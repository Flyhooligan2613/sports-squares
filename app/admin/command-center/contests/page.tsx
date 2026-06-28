"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AdminStatCard from "@/components/admin/AdminStatCard";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { ContestOperationsSummary } from "@/lib/platform/engines/commandCenter";
import { getDemoContestSummary } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";
import type { PoolStatus } from "@/lib/types";

function parseContests(body: Record<string, unknown>) {
  if (body.summary) {
    return {
      value: body.summary as ContestOperationsSummary,
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function ContestOperationsPage() {
  const { data: summary, hydrating, usingDemo } = useCommandCenterHydration({
    url: "/api/admin/command-center/contests",
    initialData: getDemoContestSummary(),
    parse: parseContests,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Contest Operations</h2>
        <p className="text-sm text-sb-muted mt-1">
          Squares boards and Pick&apos;em contests — live fill rates and lifecycle status.
        </p>
      </div>

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <AdminStatCard label="Active Pools" value={summary.activePools} accent="purple" />
        <AdminStatCard label="Open Pools" value={summary.openPools} accent="success" />
        <AdminStatCard label="Locked Pools" value={summary.lockedPools} accent="gold" />
        <AdminStatCard label="Pick'em Open" value={summary.pickemContestsOpen} accent="muted" />
        <AdminStatCard label="Pick'em Active" value={summary.pickemContestsActive} accent="success" />
        <AdminStatCard label="Avg Fill Rate" value={`${summary.averageFillRatePercent}%`} accent="purple" />
      </div>

      <LandingGlassCard className="p-4 sm:p-5 space-y-3">
        <h3 className="text-white font-semibold">Recent Boards</h3>
        {summary.recentPools.length === 0 ? (
          <p className="text-sm text-sb-muted">No pools found.</p>
        ) : (
          summary.recentPools.map((pool) => (
            <div
              key={pool.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-white/[0.06] last:border-0"
            >
              <div>
                <p className="text-white font-medium">{pool.name}</p>
                <p className="text-xs text-sb-muted">
                  {pool.awayTeam} vs {pool.homeTeam} · {pool.playerCount} players · {pool.squareFillPercent}% filled
                </p>
              </div>
              <div className="flex items-center gap-3">
                <PoolStatusBadge status={pool.status as PoolStatus} />
                <Link
                  href={`/admin/pool/${pool.id}`}
                  className="text-sm text-sb-glow hover:text-white"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))
        )}
      </LandingGlassCard>
    </div>
  );
}
