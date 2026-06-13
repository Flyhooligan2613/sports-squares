"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { EcosystemDashboard } from "@/lib/platform/ecosystem/types";

interface PlayerCardData extends EcosystemDashboard {
  legacy?: {
    lifetimeWinnings: number;
    lifetimeWins: number;
    currentStreak: number;
    longestStreak: number;
    achievements: { id: string; title: string; emoji: string }[];
    headline: string;
  } | null;
  sharePath?: string;
}

export default function PlayerCardPremium() {
  const [data, setData] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/ecosystem/player-card", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(json as PlayerCardData))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <LandingGlassCard className="p-8 text-center text-sb-muted animate-pulse">
        Loading Player Card…
      </LandingGlassCard>
    );
  }

  if (!data) return null;

  const { account, tier, tierProgressPct, creditsToNextTier, nextTier, legacy } = data;

  return (
    <LandingGlassCard className="relative overflow-hidden p-6 sm:p-8 border border-sb-purple/30">
      <div className="absolute inset-0 bg-gradient-to-br from-sb-purple/20 via-transparent to-emerald-500/10 pointer-events-none" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sb-purple-light mb-1">
              SquareBoards Player Card
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {account.username ?? account.displayName}
            </h2>
            <p className="text-sm text-sb-muted mt-1">
              {account.playerId} · Member since {new Date(account.memberSince).getFullYear()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-sb-muted">Tier</p>
            <p className="text-xl font-bold text-sb-purple-light">{tier.displayName}</p>
            <p className="text-xs text-sb-muted">Level {account.tierLevel}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-sb-muted mb-2">
            <span>Tier progress</span>
            <span>
              {nextTier ? `${creditsToNextTier.toLocaleString()} credits to ${nextTier.displayName}` : "Max tier"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sb-purple to-emerald-400 transition-all"
              style={{ width: `${tierProgressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Lifetime winnings" value={`$${(legacy?.lifetimeWinnings ?? 0).toFixed(0)}`} />
          <Stat label="Wins" value={String(legacy?.lifetimeWins ?? 0)} />
          <Stat label="Current streak" value={String(legacy?.currentStreak ?? 0)} />
          <Stat label="Tier credits" value={account.availableTierCredits.toLocaleString()} />
        </div>

        {legacy?.achievements?.length ? (
          <div className="flex flex-wrap gap-2">
            {legacy.achievements.slice(0, 6).map((a) => (
              <span
                key={a.id}
                className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white"
              >
                {a.emoji} {a.title}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
    </div>
  );
}
