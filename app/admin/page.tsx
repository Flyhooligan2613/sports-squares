"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Trophy,
  Users,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import ActivityCard, {
  ActivityCardButton,
} from "@/components/ui/ActivityCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { Button } from "@/components/ui/Button";
import { poolStore } from "@/lib/poolStore";
import type { AdminStats, Pool } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPools, setRecentPools] = useState<Pool[]>([]);

  useEffect(() => {
    poolStore.getAdminStats().then(setStats);
    poolStore.listPools().then((pools) => setRecentPools(pools.slice(0, 5)));
  }, []);

  return (
    <div className="max-w-5xl space-y-10">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor-only console — game outcomes and payouts are fully automated."
        action={
          <Button href="/admin/financial" variant="primary" size="sm">
            Financial Status
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 not-prose">
        <Link
          href="/admin/financial"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-sb-purple/30 transition-colors"
        >
          Financial Status →
        </Link>
        <Link
          href="/admin/audit-log"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-sb-purple/30 transition-colors"
        >
          Audit Log →
        </Link>
        <Link
          href="/admin/support"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white hover:border-sb-purple/30 transition-colors"
        >
          Support Inbox →
        </Link>
      </div>

      {!stats ? (
        <SkeletonKpiGrid />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Pools"
            value={stats.totalPools}
            icon={Layers}
            delay={0}
          />
          <AdminStatCard
            label="Active Pools"
            value={stats.activePools}
            accent="success"
            icon={Trophy}
            delay={60}
          />
          <AdminStatCard
            label="Completed"
            value={stats.completedPools}
            accent="gold"
            delay={120}
          />
          <AdminStatCard
            label="Total Players"
            value={stats.totalPlayers}
            accent="purple"
            icon={Users}
            delay={180}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Recent Pools</h2>
          <Link
            href="/admin/pools"
            className="inline-flex items-center gap-1 text-sm text-sb-glow hover:text-white font-medium transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentPools.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No pools yet"
            description="Create your first pool to start collecting players and selling squares."
            actionLabel="Create Pool"
            actionHref="/create"
          />
        ) : (
          <div className="space-y-4">
            {recentPools.map((pool) => (
              <ActivityCard
                key={pool.id}
                title={pool.name}
                subtitle={`${pool.awayTeam} vs ${pool.homeTeam}`}
                badge={<PoolStatusBadge status={pool.status} />}
                meta={
                  <p className="text-sb-muted text-xs">
                    {pool.participants.length} players joined
                  </p>
                }
                actions={
                  <ActivityCardButton
                    href={`/admin/pool/${pool.id}`}
                    variant="primary"
                  >
                    Manage
                  </ActivityCardButton>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
