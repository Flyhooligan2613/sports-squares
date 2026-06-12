"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/lib/motion/useCountdown";
import type { PlayerUpcomingGame } from "@/lib/player/dashboardTypes";

interface UpcomingGameCardProps {
  game: PlayerUpcomingGame;
  index: number;
}

export default function UpcomingGameCard({ game, index }: UpcomingGameCardProps) {
  const countdown = useCountdown(game.kickoffAt);
  const boardHref = game.inviteToken
    ? `/join/${game.inviteToken}`
    : `/pool/${game.poolId}`;

  return (
    <LandingGlassCard
      className="player-upcoming-card p-5 sm:p-6 admin-stat-enter"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {game.awayTeam}{" "}
            <span className="text-sb-muted font-normal">vs</span> {game.homeTeam}
          </h3>
          <p className="text-sb-muted text-sm mt-1">Board #{game.boardIndex}</p>
        </div>

        <div className="flex flex-wrap items-end gap-6 sm:gap-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">
              Starts in
            </p>
            <p className="text-xl font-bold text-sb-glow tabular-nums player-countdown">
              {countdown}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">
              You own
            </p>
            <p className="text-lg font-semibold text-white">
              {game.ownedSquareCount}{" "}
              {game.ownedSquareCount === 1 ? "Square" : "Squares"}
            </p>
          </div>
          <Button href={boardHref} variant="secondary" size="sm">
            View Board
          </Button>
        </div>
      </div>
    </LandingGlassCard>
  );
}
