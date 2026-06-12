"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency, formatTimeAgo } from "@/lib/liveWinners/format";
import type { LiveTvBigWinner } from "@/lib/liveTv/types";

interface BigWinnerCardProps {
  winner: LiveTvBigWinner | null;
}

export default function BigWinnerCard({ winner }: BigWinnerCardProps) {
  if (!winner) return null;

  return (
    <section>
      <h2 className="livetv-section-title">Big Winner of the Day</h2>
      <LandingGlassCard glow className="livetv-bigwinner-card p-5 sm:p-6 relative overflow-hidden">
        <div className="livetv-hero-shimmer" aria-hidden />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sb-gold mb-2">
            Largest Winner Today
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-sb-gold tabular-nums">
            {formatCurrency(winner.amount)}
          </p>
          <p className="text-xl font-bold text-white mt-2">{winner.maskedName}</p>
          <p className="text-sm text-sb-muted mt-1">
            {winner.awayTeam} vs {winner.homeTeam} · Board #{winner.boardIndex}
          </p>
          <p className="text-xs text-sb-muted mt-2">Paid {formatTimeAgo(winner.paidAt)}</p>
        </div>
      </LandingGlassCard>
    </section>
  );
}
