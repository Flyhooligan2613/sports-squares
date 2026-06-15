"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { CountdownGame } from "@/lib/actionCenter/types";
import { CONTEST_CTAS, EMPTY_STATE } from "@/lib/platform/language";

interface CountdownCenterProps {
  games: CountdownGame[];
}

function CountdownRow({ game }: { game: CountdownGame }) {
  const countdown = useKickoffCountdown(game.kickoffAt, game.status === "live");

  return (
    <Link
      href={game.openBoardPoolId ? `/pool/${game.openBoardPoolId}` : `/games/${game.sport}`}
      className="ac-countdown-row admin-stat-enter"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">
          {game.awayTeam} vs {game.homeTeam}
        </p>
        <p className="text-xs text-sb-muted">{game.sport.toUpperCase()}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] uppercase tracking-wider text-sb-muted">
          {countdown.isLive ? "Status" : "Kickoff in"}
        </p>
        <p
          className={[
            "text-sm font-bold tabular-nums",
            countdown.isLive ? "lwc-text-live ac-countdown-pulse" : "text-white",
          ].join(" ")}
        >
          {countdown.label}
        </p>
      </div>
    </Link>
  );
}

export default function CountdownCenter({ games }: CountdownCenterProps) {
  return (
    <section>
      <h2 className="ac-section-title">Countdown Center</h2>
      <LandingGlassCard className="p-3 sm:p-4">
        {games.length === 0 ? (
          <SectionEmptyState
            emoji="📅"
            title={EMPTY_STATE.noGamesOnClock.title}
            description={EMPTY_STATE.noGamesOnClock.body}
            actionLabel={CONTEST_CTAS.browseContests}
            actionHref="/games/nfl"
            compact
          />
        ) : (
          <div className="space-y-1">
            {games.map((game) => (
              <CountdownRow key={game.gameId} game={game} />
            ))}
          </div>
        )}
      </LandingGlassCard>
    </section>
  );
}
