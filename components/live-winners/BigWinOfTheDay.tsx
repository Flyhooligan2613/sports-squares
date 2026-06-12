"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import { formatCurrency, formatTimeAgo } from "@/lib/liveWinners/format";
import type { BigWinToday } from "@/lib/liveWinners/types";

interface BigWinOfTheDayProps {
  bigWin: BigWinToday | null;
}

export default function BigWinOfTheDay({ bigWin }: BigWinOfTheDayProps) {
  if (!bigWin) return null;

  return (
    <section className="lwc-big-win-enter">
      <LandingGlassCard glow className="lwc-big-win-card p-5 sm:p-6 relative overflow-hidden">
        <div className="lwc-big-win-shimmer" aria-hidden />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <HeroTeamLogo name={bigWin.awayTeam} size="md" />
            <span className="text-sb-muted text-sm font-semibold">vs</span>
            <HeroTeamLogo name={bigWin.homeTeam} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sb-gold mb-1">
              💰 Biggest Win Today
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-sb-gold tabular-nums lwc-big-win-amount">
              {formatCurrency(bigWin.amount)}
            </p>
            <p className="text-white font-semibold mt-1 truncate">
              {bigWin.awayTeam} vs {bigWin.homeTeam}
            </p>
            <p className="text-sb-muted text-sm mt-0.5">
              Board #{bigWin.boardIndex} · {bigWin.maskedWinner} · Paid{" "}
              {formatTimeAgo(bigWin.paidAt)}
            </p>
          </div>
        </div>
      </LandingGlassCard>
    </section>
  );
}
