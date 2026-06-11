"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { poolStore } from "@/lib/poolStore";
import type { Pool } from "@/lib/types";

function squaresRemaining(pool: Pool): number {
  return pool.squares.filter((s) => !s.claimed).length;
}

function isOpenForPlayers(pool: Pool): boolean {
  return pool.status === "open";
}

function formatPrice(pool: Pool): string {
  const cost = pool.costPerSquare ?? 0;
  if (cost <= 0) return "Free";
  return `$${cost.toFixed(2)}`;
}

export default function FeaturedPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    poolStore
      .listPools()
      .then((all) => {
        const visible = all
          .filter((p) => p.status !== "archived")
          .sort((a, b) => {
            const aOpen = isOpenForPlayers(a) ? 0 : 1;
            const bOpen = isOpenForPlayers(b) ? 0 : 1;
            if (aOpen !== bOpen) return aOpen - bOpen;
            return a.name.localeCompare(b.name);
          });
        setPools(visible);
      })
      .catch(() => setPools([]))
      .finally(() => setLoading(false));
  }, [pathname]);

  return (
    <section id="pools" className="scroll-mt-20 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-2">
            Featured Games
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            Pick a game, buy your squares, and choose your spots on the board.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <p className="text-slate-300 font-medium mb-2">No public pools yet</p>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Have a pool code or invite link? Enter it above to join your game.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pools.map((pool) => {
              const remaining = squaresRemaining(pool);
              const open = isOpenForPlayers(pool);

              return (
                <article
                  key={pool.id}
                  className="group flex flex-col bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-100 text-base sm:text-lg truncate group-hover:text-indigo-300 transition-colors">
                          {pool.name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {pool.awayTeam}{" "}
                          <span className="text-slate-600">vs</span>{" "}
                          {pool.homeTeam}
                        </p>
                      </div>
                      <PoolStatusBadge status={pool.status} />
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                      <div>
                        <dt className="text-slate-500">Squares left</dt>
                        <dd className="text-slate-200 font-semibold font-mono">
                          {remaining}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Per square</dt>
                        <dd className="text-emerald-400 font-semibold font-mono">
                          {formatPrice(pool)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Players</dt>
                        <dd className="text-slate-200 font-medium">
                          {pool.participants.length}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Status</dt>
                        <dd className="text-slate-200 font-medium">
                          {open ? "Open" : "Closed"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <Link
                      href={`/pool/${pool.id}`}
                      className={[
                        "flex items-center justify-center w-full min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-[0.98]",
                        open
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700",
                      ].join(" ")}
                    >
                      {open ? "Join & Buy Squares" : "View Pool"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
