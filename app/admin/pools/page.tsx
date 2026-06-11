"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { poolStore } from "@/lib/poolStore";
import type { Pool } from "@/lib/types";

export default function AdminPoolsPage() {
  const router = useRouter();
  const [pools, setPools] = useState<Pool[]>([]);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const loadPools = useCallback(() => {
    poolStore.listPools().then(setPools);
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  async function handleDuplicate(poolId: string) {
    setDuplicatingId(poolId);
    const duplicated = await poolStore.duplicatePool(poolId);
    setDuplicatingId(null);

    if (duplicated) {
      router.push(`/admin/pool/${duplicated.id}`);
      return;
    }

    loadPools();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Pools</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all sports squares pools.
          </p>
        </div>
        <Link
          href="/create"
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Pool
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {pools.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No pools found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Pool
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Players
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pools.map((pool) => (
                  <tr
                    key={pool.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-200">{pool.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {pool.awayTeam} vs {pool.homeTeam}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <PoolStatusBadge status={pool.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {pool.participants.length}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/pool/${pool.id}`}
                          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/pool/${pool.id}`}
                          className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(pool.id)}
                          disabled={duplicatingId === pool.id}
                          className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {duplicatingId === pool.id ? "Copying..." : "Duplicate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
