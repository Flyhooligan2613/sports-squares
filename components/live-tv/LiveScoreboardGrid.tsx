"use client";

import Link from "next/link";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveTvScoreboardGame } from "@/lib/liveTv/types";

interface LiveScoreboardGridProps {
  games: LiveTvScoreboardGame[];
}

function statusClass(status: LiveTvScoreboardGame["status"]): string {
  if (status === "live") return "livetv-status-live";
  if (status === "final") return "livetv-status-final";
  return "livetv-status-upcoming";
}

export default function LiveScoreboardGrid({ games }: LiveScoreboardGridProps) {
  return (
    <section>
      <h2 className="livetv-section-title">Live Game Scoreboard</h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {games.length === 0 ? (
          <LandingGlassCard className="p-6 col-span-full text-center">
            <p className="text-sb-muted text-sm">Live scoreboard loading…</p>
          </LandingGlassCard>
        ) : (
          games.map((game) => (
            <Link
              key={game.gameId}
              href={game.poolId ? `/pool/${game.poolId}` : `/games/${game.sport}`}
            >
              <LandingGlassCard
                className={[
                  "livetv-score-card p-4 h-full",
                  game.status === "live" ? "livetv-score-card-live" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="lwc-sport-chip">{game.sportLabel}</span>
                  <span className={`livetv-status-chip ${statusClass(game.status)}`}>
                    {game.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <HeroTeamLogo name={game.awayTeam} size="sm" />
                  <div className="flex-1 text-center min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {game.awayTeam}
                    </p>
                    {game.homeScore !== null && game.awayScore !== null ? (
                      <p className="text-xl font-bold text-white tabular-nums my-1">
                        {game.awayScore} – {game.homeScore}
                      </p>
                    ) : (
                      <p className="text-xs text-sb-muted my-1">vs</p>
                    )}
                    <p className="text-sm font-bold text-white truncate">
                      {game.homeTeam}
                    </p>
                  </div>
                  <HeroTeamLogo name={game.homeTeam} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-sb-muted">Period</p>
                    <p className="text-white font-semibold">
                      {game.periodLabel ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sb-muted">Clock</p>
                    <p className="text-white font-semibold">
                      {game.clockLabel ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sb-muted">Board</p>
                    <p className="text-white font-semibold">
                      #{game.boardIndex ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sb-muted">Pool</p>
                    <p className="text-sb-gold font-semibold tabular-nums">
                      {formatCurrency(game.prizePool)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-sb-muted mt-2">
                  {game.squaresRemaining} squares remaining
                </p>
              </LandingGlassCard>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
