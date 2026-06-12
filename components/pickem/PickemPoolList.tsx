"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatTierCents } from "@/lib/platform/core/entryTiers";
import type { PickemPoolSummary } from "@/lib/pickem/types";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface PickemPoolListProps {
  pools: PickemPoolSummary[];
  entryTierCents: number;
  myPoolNumber?: number | null;
}

export default function PickemPoolList({
  pools,
  entryTierCents,
  myPoolNumber,
}: PickemPoolListProps) {
  if (!pools.length) return null;

  const tierLabel = formatTierCents(entryTierCents);

  return (
    <LandingGlassCard className="p-4 sm:p-5 mb-6">
      <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">
        {tierLabel} pools · auto-fill
      </p>
      <h2 className="text-white font-semibold mb-3">
        Join the next open pool — never &quot;Contest Full&quot;
      </h2>
      <div className="space-y-2">
        {pools.map((pool) => {
          const isMine = myPoolNumber === pool.poolNumber;
          const fillPct = Math.round((pool.playerCount / pool.maxPlayers) * 100);
          const isFull = pool.playerCount >= pool.maxPlayers;

          return (
            <div
              key={pool.id}
              className={`rounded-xl border px-4 py-3 ${
                isMine
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-white font-medium">
                  {pool.label}
                  {isMine ? (
                    <span className="ml-2 text-xs text-emerald-400 font-semibold">
                      · Your pool
                    </span>
                  ) : null}
                </span>
                <span className="text-sm text-sb-muted">
                  {formatMoney(pool.prizePoolCents)} prize pool
                </span>
              </div>
              <div className="pickem-progress-track h-1.5 mb-1">
                <div
                  className={`pickem-progress-bar ${isFull ? "bg-amber-400/80" : ""}`}
                  style={{ width: `${Math.min(100, fillPct)}%` }}
                />
              </div>
              <p className="text-xs text-sb-muted">
                {pool.playerCount.toLocaleString()} / {pool.maxPlayers.toLocaleString()} players
                {isFull ? " · Full — Pool #" + (pool.poolNumber + 1) + " open next" : ""}
                {pool.resolutionStatus === "tiebreaker_active" ? " · Tiebreaker active" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </LandingGlassCard>
  );
}
