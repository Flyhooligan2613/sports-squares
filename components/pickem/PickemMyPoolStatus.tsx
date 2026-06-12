"use client";

import { useEffect, useState } from "react";
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

function KickoffCountdown({ targetIso }: { targetIso: string | null }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!targetIso) {
      setLabel(null);
      return;
    }
    function tick() {
      const diff = new Date(targetIso!).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Kickoff passed");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(`${h}h ${m}m to next kickoff`);
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!label) return null;
  return <span className="text-emerald-300/90">{label}</span>;
}

interface PickemMyPoolStatusProps {
  pool: PickemPoolSummary;
  entryTierCents: number;
  contestLabel: string;
}

export default function PickemMyPoolStatus({
  pool,
  entryTierCents,
  contestLabel,
}: PickemMyPoolStatusProps) {
  const tierLabel = formatTierCents(entryTierCents);

  return (
    <LandingGlassCard className="p-5 sm:p-6 mb-6 border border-emerald-500/25 bg-emerald-500/5">
      <p className="text-xs uppercase tracking-wider text-emerald-400/90 mb-1">
        Your pool · {contestLabel}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {tierLabel} · {pool.label}
          </h2>
          <p className="text-sm text-sb-muted mt-1 capitalize">{pool.poolStatusLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatMoney(pool.prizePoolCents)}</p>
          <p className="text-xs text-sb-muted">prize pool</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
        <div>
          <p className="text-xs uppercase text-sb-muted">Joined</p>
          <p className="text-lg font-bold text-white">
            {pool.playerCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-sb-muted">Remaining</p>
          <p className="text-lg font-bold text-white">
            {pool.remainingSpots.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-sb-muted">Capacity</p>
          <p className="text-lg font-bold text-white">
            {pool.maxPlayers.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-sb-muted">Status</p>
          <p className="text-sm font-semibold text-white capitalize">
            {pool.poolStatusLabel}
          </p>
        </div>
      </div>

      <div className="pickem-progress-track h-2 mb-2">
        <div
          className="pickem-progress-bar"
          style={{
            width: `${Math.min(100, Math.round((pool.playerCount / pool.maxPlayers) * 100))}%`,
          }}
        />
      </div>

      <p className="text-xs text-sb-muted">
        {pool.playerCount.toLocaleString()} / {pool.maxPlayers.toLocaleString()} players
        {pool.remainingSpots <= 100 && pool.remainingSpots > 0
          ? ` · ${pool.remainingSpots} spots remaining`
          : ""}
        {pool.nextKickoffAt ? (
          <>
            {" · "}
            <KickoffCountdown targetIso={pool.nextKickoffAt} />
          </>
        ) : null}
      </p>
    </LandingGlassCard>
  );
}
