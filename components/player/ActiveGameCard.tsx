"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useCountUp } from "@/lib/motion/useCountUp";
import type { PlayerActiveGame } from "@/lib/player/dashboardTypes";

interface ActiveGameCardProps {
  game: PlayerActiveGame;
  index: number;
}

export default function ActiveGameCard({ game, index }: ActiveGameCardProps) {
  const prize = useCountUp(game.potentialPrize ?? 0, Boolean(game.potentialPrize), {
    duration: 900,
    delay: 200 + index * 80,
  });

  const watchHref = game.inviteToken
    ? `/join/${game.inviteToken}`
    : `/pool/${game.poolId}`;

  return (
    <LandingGlassCard
      glow={game.isLive}
      className={[
        "player-active-card p-5 sm:p-6 lg:p-7",
        game.isLive ? "player-active-card-live" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          {game.isLive && (
            <span className="player-live-badge mb-3">
              <span className="player-live-dot" />
              LIVE
            </span>
          )}
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {game.awayTeam}{" "}
            <span className="text-sb-muted font-normal">vs</span> {game.homeTeam}
          </h3>
          <p className="text-sb-muted text-sm mt-1">
            Board #{game.boardIndex}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">
            Kickoff
          </p>
          <p className="text-sm sm:text-base font-semibold text-white">
            {game.kickoffLabel}
          </p>
        </div>
      </div>

      {game.homeScore !== null && game.awayScore !== null && (
        <div className="player-scoreboard mb-5">
          <div className="player-score-row">
            <span className="player-score-team">{game.awayTeam}</span>
            <span className="player-score-value">{game.awayScore}</span>
          </div>
          <div className="player-score-row">
            <span className="player-score-team">{game.homeTeam}</span>
            <span className="player-score-value">{game.homeScore}</span>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">
            Your Squares
          </p>
          <div className="flex flex-wrap gap-2">
            {game.ownedSquares.length > 0 ? (
              game.ownedSquares.map((sq) => (
                <span key={sq} className="player-square-chip">
                  {sq}
                </span>
              ))
            ) : (
              <span className="text-sb-muted text-sm">No squares claimed yet</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">
            Current Quarter Winner
          </p>
          <p className="text-lg font-semibold text-white">
            {game.currentQuarterWinner ?? "Still in play"}
          </p>
          {game.potentialPrize != null && game.potentialPrize > 0 && (
            <p className="text-sm text-sb-muted mt-2">
              Potential Prize{" "}
              <span className="text-sb-gold font-bold tabular-nums">
                ${prize.toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      <Button href={watchHref} className="w-full sm:w-auto player-btn-glow">
        Watch Live →
      </Button>
    </LandingGlassCard>
  );
}
