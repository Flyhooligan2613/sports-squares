"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  DollarSign,
  Grid3X3,
  Users,
} from "lucide-react";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/Button";
import {
  getSportLabel,
  parsePoolDisplayMeta,
} from "@/lib/landing/poolDisplay";
import { listInviteSessions } from "@/lib/invites/session";
import { normalizePoolCode, parseJoinInput } from "@/lib/landing/join";
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
  }, []);

  return (
    <section id="pools" className="scroll-mt-20 sb-section">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeader
            title="Featured Games"
            subtitle="Live matchups open for square purchases — pick your game and join the board."
          />
        </ScrollReveal>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : pools.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
              <p className="text-slate-300 font-medium mb-2">
                No public pools yet
              </p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Have a pool code or invite link? Enter it above to join your
                game.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {pools.map((pool, index) => {
              const remaining = squaresRemaining(pool);
              const open = isOpenForPlayers(pool);
              const meta = parsePoolDisplayMeta(pool.name);
              const sport = getSportLabel(pool.espnSport);

              return (
                <ScrollReveal key={pool.id} delay={index * 80}>
                  <article className="sb-card-hover group flex flex-col h-full overflow-hidden">
                    <div className="px-5 pt-5 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 to-slate-900/50">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
                          {sport}
                        </span>
                        <PoolStatusBadge status={pool.status} />
                      </div>
                      <h3 className="font-bold text-slate-50 text-lg leading-snug mb-1 group-hover:text-indigo-200 transition-colors">
                        {pool.awayTeam}{" "}
                        <span className="text-slate-600 font-normal text-sm">
                          vs
                        </span>{" "}
                        {pool.homeTeam}
                      </h3>
                      <p className="text-slate-500 text-xs truncate">
                        {pool.name}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {meta.gameDate}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {meta.kickoffTime}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 grid grid-cols-2 gap-4">
                      <Stat
                        icon={DollarSign}
                        label="Per square"
                        value={formatPrice(pool)}
                        accent
                      />
                      <Stat
                        icon={Grid3X3}
                        label="Squares left"
                        value={String(remaining)}
                      />
                      <Stat
                        icon={Users}
                        label="Players joined"
                        value={String(pool.participants.length)}
                      />
                      <Stat
                        icon={Clock}
                        label="Status"
                        value={open ? "Open" : "Closed"}
                      />
                    </div>

                    <div className="px-5 pb-5 pt-0">
                      <Link
                        href={`/pool/${pool.id}`}
                        className={[
                          "sb-btn-primary flex items-center justify-center w-full min-h-[50px] rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98]",
                          open
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 hover:shadow-indigo-500/35"
                            : "bg-slate-800 text-slate-400 border border-slate-700 pointer-events-auto",
                        ].join(" ")}
                      >
                        Join Pool
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] uppercase tracking-wider font-medium mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p
        className={[
          "text-base font-bold font-mono",
          accent ? "text-emerald-400" : "text-slate-100",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}