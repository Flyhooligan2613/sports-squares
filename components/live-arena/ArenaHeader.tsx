"use client";

import FlipScore from "./FlipScore";
import { formatClock } from "@/lib/live-arena/squareUtils";

interface ArenaHeaderProps {
  awayTeam: string;
  awayAbbr: string;
  homeTeam: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  quarter: number;
  clock: string;
  prizePool: number;
  contestType: string;
  scoreFlash: boolean;
}

export default function ArenaHeader({
  awayTeam,
  awayAbbr,
  homeTeam,
  homeAbbr,
  awayScore,
  homeScore,
  quarter,
  clock,
  prizePool,
  contestType,
  scoreFlash,
}: ArenaHeaderProps) {
  return (
    <header className="la-glass-card p-3 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="la-live-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Live
            </span>
            <span className="la-network-dot flex items-center gap-1 text-[10px] text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight mt-1.5 truncate">
            {awayTeam} vs {homeTeam}
          </h1>
          <p className="text-[11px] text-sb-muted mt-0.5">
            {formatClock(quarter, clock)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted">
            Prize Pool
          </p>
          <p className="text-sm font-bold text-sb-gold tabular-nums">
            ${prizePool.toLocaleString()}
          </p>
          <p className="text-[10px] text-sb-muted mt-0.5">{contestType}</p>
        </div>
      </div>

      <div
        className={[
          "flex items-center justify-center gap-3 sm:gap-5 py-2 rounded-xl bg-black/25 border border-white/[0.04]",
          scoreFlash ? "la-haptic-shake" : "",
        ].join(" ")}
      >
        <div className="text-center min-w-[72px]">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-0.5">
            {awayAbbr}
          </p>
          <p className="text-3xl sm:text-4xl font-bold">
            <FlipScore value={awayScore} />
          </p>
        </div>
        <span className="text-sb-muted text-sm font-medium">—</span>
        <div className="text-center min-w-[72px]">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-0.5">
            {homeAbbr}
          </p>
          <p className="text-3xl sm:text-4xl font-bold">
            <FlipScore value={homeScore} />
          </p>
        </div>
      </div>
    </header>
  );
}
