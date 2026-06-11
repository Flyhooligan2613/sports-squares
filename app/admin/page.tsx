"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminStatCard from "@/components/admin/AdminStatCard";
import PoolStatusBadge from "@/components/PoolStatusBadge";
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
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of all pools and players.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminStatCard label="Total Pools" value={stats.totalPools} />
          <AdminStatCard
            label="Active Pools"
            value={stats.activePools}
            accent="green"
          />
          <AdminStatCard
            label="Completed Pools"
            value={stats.completedPools}
            accent="amber"
          />
          <AdminStatCard
            label="Total Players"
            value={stats.totalPlayers}
            accent="purple"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-slate-300 font-semibold text-sm">Recent Pools</h2>
        <Link
          href="/admin/pools"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {recentPools.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No pools yet.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recentPools.map((pool) => (
              <li
                key={pool.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-200 truncate">
                      {pool.name}
                    </p>
                    <PoolStatusBadge status={pool.status} />
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {pool.participants.length} players
                  </p>
                </div>
                <Link
                  href={`/admin/pool/${pool.id}`}
                  className="shrink-0 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
