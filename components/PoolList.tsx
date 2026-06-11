"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { poolStore } from "@/lib/poolStore";
import type { Pool } from "@/lib/types";

export default function PoolList() {
  const [pools, setPools] = useState<Pool[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    poolStore
      .listPools()
      .then((all) =>
        setPools(all.filter((p) => p.status !== "archived"))
      )
      .catch(() => setPools([]));
  }, [pathname]);

  if (pools.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-16">
      <h2 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-4">
        Active Pools
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {pools.map((pool) => (
          <Link
            key={pool.id}
            href={`/pool/${pool.id}`}
            className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {pool.name}
                </p>
                <PoolStatusBadge status={pool.status} />
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {pool.awayTeam} vs {pool.homeTeam}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm font-medium">
                {pool.participants.length} players
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                {pool.squares.filter((s) => s.claimed).length} / 100 claimed
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
