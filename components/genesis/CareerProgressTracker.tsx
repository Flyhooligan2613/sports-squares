"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function CareerProgressTracker({ compact = false }: { compact?: boolean }) {
  const { progress, loading } = useGenesis();

  if (loading || !progress?.rookieSeason.active) return null;

  const { career } = progress;

  return (
    <LandingGlassCard className={compact ? "p-4" : "p-5 sm:p-6"}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sb-muted">Career Progress</p>
          <p className="text-lg font-bold text-white">{career.rankTitle}</p>
        </div>
        <p className="text-sm text-sb-muted tabular-nums">
          {career.missionsCompleted}/{career.missionsTotal} missions
        </p>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-sb-purple to-sb-glow transition-all duration-500"
          style={{ width: `${career.progressPct}%` }}
        />
      </div>
      <p className="text-xs text-sb-muted">
        Next goal: <span className="text-white">{career.nextGoal}</span>
      </p>
      {!compact ? (
        <p className="text-[10px] text-sb-muted mt-2 tabular-nums">
          {career.xpEarned} / {career.xpTotal} mission XP earned
        </p>
      ) : null}
    </LandingGlassCard>
  );
}
