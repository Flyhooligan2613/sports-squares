"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PersonalPulse } from "@/lib/platform/alive/types";
import { ALIVE_BRAND, ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

interface PersonalPulseCardProps {
  pulse: PersonalPulse | null;
  loading?: boolean;
}

export function PersonalPulseCardSkeleton() {
  return (
    <LandingGlassCard className="alive-pulse-card p-5 sm:p-6">
      <div className="sb-xp-skeleton h-6 w-40 mb-4" />
      <div className="sb-xp-skeleton alive-xp-bar h-2 w-full mb-4 rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sb-xp-skeleton h-14 rounded-xl" />
        ))}
      </div>
    </LandingGlassCard>
  );
}

export default function PersonalPulseCard({ pulse, loading }: PersonalPulseCardProps) {
  if (loading || !pulse) {
    return <PersonalPulseCardSkeleton />;
  }

  return (
    <LandingGlassCard className="alive-pulse-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sb-glow font-semibold">
            {ALIVE_BRAND.personalPulse}
          </p>
          <h3 className="text-lg font-bold text-white mt-1">Your Progress</h3>
          <p className="text-xs text-sb-muted mt-0.5">{ALIVE_COPY.personalPulseSubtitle}</p>
        </div>
        <Link
          href="/my-games/profile"
          className="text-xs font-semibold text-sb-glow hover:text-white transition-colors"
        >
          View profile →
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-sb-muted mb-1.5">
          <span>
            {pulse.tierLabel} · Level {pulse.tierLevel}
          </span>
          <span>{pulse.tierProgressPct}%</span>
        </div>
        <div className="alive-xp-bar-track rounded-full h-2 overflow-hidden">
          <div
            className="alive-xp-bar-fill h-full rounded-full"
            style={{ width: `${Math.min(100, pulse.tierProgressPct)}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mb-4">
        {pulse.stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">
              {stat.emoji} {stat.label}
            </dt>
            <dd className="text-base font-bold text-white tabular-nums mt-0.5">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2 text-xs text-sb-muted border-t border-white/5 pt-3">
        <span>
          🎖️ {pulse.achievementsUnlocked}/{pulse.achievementsTotal} achievements
        </span>
        <span>·</span>
        <span>
          🎯 {pulse.dailyMissionsComplete}/{pulse.dailyMissionsTotal} daily missions
        </span>
        {pulse.squarePassActive ? (
          <>
            <span>·</span>
            <span className="text-sb-glow">{ALIVE_BRAND.squarePass} active</span>
          </>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}
