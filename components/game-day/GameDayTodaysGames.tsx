"use client";

import ActiveGameCard from "@/components/player/ActiveGameCard";
import UpcomingGameCard from "@/components/player/UpcomingGameCard";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { GameDayTodaysGames } from "@/lib/gameDay/types";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export default function GameDayTodaysGames({ games }: { games: GameDayTodaysGames }) {
  const hasGames = games.active.length > 0 || games.upcoming.length > 0;

  return (
    <section className="mb-10 sm:mb-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="gd-section-title mb-0">Today&apos;s Games</h2>
        <Link
          href="/contest-center"
          className="text-xs font-semibold text-sb-glow hover:text-white transition-colors"
        >
          {PLATFORM_TERMS.browseLiveContests} →
        </Link>
      </div>

      {!hasGames ? (
        <LandingGlassCard className="p-8 sm:p-10 text-center gd-empty-games">
          <p className="text-3xl mb-3" aria-hidden>
            🏈
          </p>
          <p className="text-white font-semibold mb-2">No boards yet today</p>
          <p className="text-sb-muted text-sm mb-6 max-w-sm mx-auto">
            Join a Square Board and your live games, countdowns, and checkpoints will show up here.
          </p>
          <Button href="/contest-center">{PLATFORM_TERMS.findAContest}</Button>
        </LandingGlassCard>
      ) : (
        <div className="space-y-4">
          {games.active.map((game, index) => (
            <ActiveGameCard key={game.poolId} game={game} index={index} />
          ))}
          {games.upcoming.map((game, index) => (
            <UpcomingGameCard key={game.poolId} game={game} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
