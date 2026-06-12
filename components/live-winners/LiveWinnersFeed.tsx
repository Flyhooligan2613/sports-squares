"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency, formatTimeAgo } from "@/lib/liveWinners/format";
import { getPayoutDisplayStatus } from "@/lib/liveWinners/display";
import type { LiveWinnerFeedItem } from "@/lib/liveWinners/types";

interface LiveWinnersFeedProps {
  winners: LiveWinnerFeedItem[];
}

export default function LiveWinnersFeed({ winners }: LiveWinnersFeedProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">Live Winners Feed</h2>
        <span className="lwc-live-pill">
          <span className="lwc-live-dot" />
          Live
        </span>
      </div>

      {winners.length === 0 ? (
        <LandingGlassCard glow className="p-8 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white font-semibold mb-2">Winners incoming</p>
          <p className="text-sb-muted text-sm">
            When quarters end, winners and automatic payouts appear here in real time.
          </p>
        </LandingGlassCard>
      ) : (
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <LandingGlassCard
              key={winner.id}
              glow={index === 0}
              className={[
                "lwc-winner-card p-4 sm:p-5",
                index === 0 ? "lwc-winner-card-new" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="lwc-sport-chip">{winner.sport}</span>
                    <span className="text-xs text-sb-muted">{formatTimeAgo(winner.wonAt)}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {winner.awayTeam}{" "}
                    <span className="text-sb-muted font-normal">vs</span> {winner.homeTeam}
                  </h3>
                  <p className="text-sm text-sb-muted mt-1">
                    Board #{winner.boardIndex} · {winner.periodLabel}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-sb-gold tabular-nums">
                    +{formatCurrency(winner.amount)}
                  </p>
                  <p
                    className={[
                      "text-xs font-semibold mt-1",
                      winner.payoutStatus === "paid"
                        ? "text-sb-success"
                        : "text-sb-muted",
                    ].join(" ")}
                  >
                    {getPayoutDisplayStatus(winner.payoutStatus)}
                  </p>
                </div>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </section>
  );
}
