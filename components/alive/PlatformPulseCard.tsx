"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PlatformPulse } from "@/lib/platform/alive/types";
import { ALIVE_BRAND, ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

interface PlatformPulseCardProps {
  greeting: string;
  displayName: string;
  pulse: PlatformPulse | null;
  loading?: boolean;
}

export function PlatformPulseCardSkeleton() {
  return (
    <LandingGlassCard className="alive-pulse-card p-5 sm:p-6">
      <div className="sb-xp-skeleton h-8 w-56 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sb-xp-skeleton h-16 rounded-xl" />
        ))}
      </div>
    </LandingGlassCard>
  );
}

export default function PlatformPulseCard({
  greeting,
  displayName,
  pulse,
  loading,
}: PlatformPulseCardProps) {
  if (loading || !pulse) {
    return <PlatformPulseCardSkeleton />;
  }

  return (
    <LandingGlassCard className="alive-pulse-card p-5 sm:p-6" glow={pulse.isLive}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {greeting}, {displayName} 👋
          </h2>
          <p className="text-sm text-sb-muted mt-1">{ALIVE_COPY.platformPulseSubtitle}</p>
        </div>
        {pulse.isLive ? (
          <span className="alive-live-badge sb-status-badge sb-status-badge--pulse">
            <span className="sb-live-dot" aria-hidden />
            Live
          </span>
        ) : null}
      </div>

      <p className="text-[10px] uppercase tracking-wider text-sb-glow font-semibold mb-3">
        {ALIVE_BRAND.platformPulse}
      </p>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pulse.stats.map((stat) => (
          <div key={stat.label} className="alive-stat-cell rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted leading-tight">
              {stat.emoji ? `${stat.emoji} ` : ""}
              {stat.label}
            </dt>
            <dd className="text-lg sm:text-xl font-bold text-white tabular-nums mt-1 alive-stat-value">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </LandingGlassCard>
  );
}
