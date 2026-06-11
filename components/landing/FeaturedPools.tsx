"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Grid3X3,
  Trophy,
  Users,
} from "lucide-react";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  getSportLabel,
  parsePoolDisplayMeta,
} from "@/lib/landing/poolDisplay";
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
    <LandingSection id="pools" scrollMargin>
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Featured Games"
          title="Live matchups open now"
          subtitle="Pick your game, buy your squares, and compete for every quarter."
        />
      </ScrollReveal>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 landing-skeleton" />
          ))}
        </div>
      ) : pools.length === 0 ? (
        <ScrollReveal>
          <div className="landing-glass-card text-center py-16 px-6 border-dashed border-white/10">
            <Trophy className="w-10 h-10 text-sb-glow mx-auto mb-4 opacity-60" />
            <p className="text-white font-semibold text-lg mb-2">
              No public pools yet
            </p>
            <p className="text-sb-muted text-sm max-w-sm mx-auto leading-relaxed">
              Have a pool code or invite link? Enter it above to join your game.
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
                <article className="landing-pool-card group">
                  <div className="landing-pool-card-header">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-sb-purple/15 border border-sb-purple/25 text-sb-glow text-[11px] font-bold uppercase tracking-wider">
                        {sport}
                      </span>
                      <PoolStatusBadge status={pool.status} />
                    </div>
                    <h3 className="font-bold text-white text-xl leading-snug mb-1 group-hover:text-sb-glow transition-colors">
                      {pool.awayTeam}{" "}
                      <span className="text-sb-muted font-normal text-sm">
                        vs
                      </span>{" "}
                      {pool.homeTeam}
                    </h3>
                    <p className="text-sb-muted text-xs truncate">{pool.name}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-sb-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sb-glow/70" />
                        {meta.gameDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sb-glow/70" />
                        {meta.kickoffTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 grid grid-cols-2 gap-3">
                    <PoolStat
                      icon={DollarSign}
                      label="Per square"
                      value={formatPrice(pool)}
                      accent
                    />
                    <PoolStat
                      icon={Grid3X3}
                      label="Squares left"
                      value={String(remaining)}
                    />
                    <PoolStat
                      icon={Users}
                      label="Players joined"
                      value={String(pool.participants.length)}
                    />
                    <PoolStat
                      icon={Clock}
                      label="Status"
                      value={open ? "Open" : "Closed"}
                      accent={open}
                    />
                  </div>

                  <div className="px-5 pb-5 pt-0">
                    <Link
                      href={`/pool/${pool.id}`}
                      className={[
                        "sb-btn-primary sb-btn-motion landing-pool-join-btn flex items-center justify-center gap-1 w-full min-h-[52px] rounded-xl font-semibold text-sm group/btn",
                        open
                          ? ""
                          : "opacity-60 !shadow-none pointer-events-auto !translate-y-0",
                      ].join(" ")}
                    >
                      Join Pool
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </LandingSection>
  );
}

function PoolStat({
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
    <div className="landing-pool-stat">
      <div className="flex items-center gap-1.5 text-sb-muted text-[10px] uppercase tracking-wider font-semibold mb-1">
        <Icon className="w-3 h-3 text-sb-glow/80" />
        {label}
      </div>
      <p
        className={[
          "text-base font-bold font-mono tabular-nums",
          accent ? "text-sb-success" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
