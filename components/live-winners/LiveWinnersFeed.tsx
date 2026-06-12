"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import { formatCurrency, formatTimeAgo } from "@/lib/liveWinners/format";
import {
  getGameStatusClass,
  getPayoutDisplayStatus,
  getPayoutStatusClass,
  periodBadgeClass,
} from "@/lib/liveWinners/display";
import type { LiveWinnerFeedItem } from "@/lib/liveWinners/types";

interface LiveWinnersFeedProps {
  winners: LiveWinnerFeedItem[];
}

function WinnerEventCard({
  winner,
  index,
}: {
  winner: LiveWinnerFeedItem;
  index: number;
}) {
  const showLiveScore =
    winner.gameStatus === "live" &&
    winner.liveHomeScore !== null &&
    winner.liveAwayScore !== null;
  const showFinalScore =
    winner.homeScore !== null &&
    winner.awayScore !== null &&
    !showLiveScore;

  return (
    <LandingGlassCard
      glow={index === 0}
      className={[
        "lwc-winner-event p-4 sm:p-5",
        index === 0 ? "lwc-winner-card-new" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`lwc-period-badge ${periodBadgeClass(winner.quarter)}`}>
            🏆 {winner.periodLabel.toUpperCase()}
          </span>
          <span className="lwc-sport-chip">{winner.sport}</span>
          {winner.gameStatus ? (
            <span
              className={`lwc-game-status-chip ${getGameStatusClass(winner.gameStatus)}`}
            >
              {winner.gameStatus === "live"
                ? "Live"
                : winner.gameStatus === "upcoming"
                  ? "Upcoming"
                  : "Final"}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-sb-muted">{formatTimeAgo(winner.wonAt)}</span>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <HeroTeamLogo name={winner.awayTeam} size="sm" />
          <div className="min-w-0 text-center flex-1">
            <p className="text-sm sm:text-base font-bold text-white truncate">
              {winner.awayTeam}
            </p>
            {showLiveScore ? (
              <p className="text-lg font-bold text-white tabular-nums">
                {winner.liveAwayScore} – {winner.liveHomeScore}
              </p>
            ) : showFinalScore ? (
              <p className="text-lg font-bold text-white tabular-nums">
                {winner.awayScore} – {winner.homeScore}
              </p>
            ) : (
              <p className="text-xs text-sb-muted font-semibold">vs</p>
            )}
            <p className="text-sm sm:text-base font-bold text-white truncate">
              {winner.homeTeam}
            </p>
          </div>
          <HeroTeamLogo name={winner.homeTeam} size="sm" />
        </div>
      </div>

      {winner.gameStatus === "live" && winner.liveClock ? (
        <p className="text-xs text-sb-muted mb-3 lwc-live-clock">
          {winner.liveClock}
          {winner.livePeriod ? ` · Period ${winner.livePeriod}` : ""}
        </p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
            Board
          </p>
          <p className="text-sm font-bold text-white">#{winner.boardIndex}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
            {winner.periodShort}
          </p>
          <p className="text-sm font-bold text-white">Winner</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
            Winner
          </p>
          <p className="text-sm font-bold text-white truncate">{winner.maskedWinner}</p>
        </div>
        <div className="text-right sm:text-left">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
            Won
          </p>
          <p className="text-lg font-bold text-sb-gold tabular-nums">
            {formatCurrency(winner.amount)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`lwc-payout-badge ${getPayoutStatusClass(winner.payoutStatus)}`}
        >
          {winner.payoutStatus === "paid" ? "✅" : "⏳"}{" "}
          {getPayoutDisplayStatus(winner.payoutStatus)}
        </span>
        {winner.winningSquare !== null ? (
          <span className="text-xs text-sb-muted">
            Square #{winner.winningSquare}
          </span>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}

export default function LiveWinnersFeed({ winners }: LiveWinnersFeedProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">Live Winners Feed</h2>
        <StatusBadge variant="live" pulse dot>
          Live
        </StatusBadge>
      </div>

      {winners.length === 0 ? (
        <LandingGlassCard glow className="p-8">
          <SectionEmptyState
            emoji="🏆"
            title="Winners incoming"
            description="When quarters end, winners and automatic payouts appear here in real time."
            actionLabel="Browse Live Boards"
            actionHref="/action-center"
          />
        </LandingGlassCard>
      ) : (
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <WinnerEventCard key={winner.id} winner={winner} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
