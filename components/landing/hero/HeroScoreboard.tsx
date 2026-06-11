"use client";

import { Clock } from "lucide-react";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import { teamAbbrev } from "@/lib/landing/useHeroFeaturedPool";
import { getSportLabel, parsePoolDisplayMeta } from "@/lib/landing/poolDisplay";
import type { EspnLiveGame, Pool } from "@/lib/types";

interface HeroScoreboardProps {
  pool: Pool | null;
  liveGame: EspnLiveGame | null;
}

function periodLabel(game: EspnLiveGame | null): string {
  if (!game) return "Pre-Game";
  if (game.gameCompleted) return "Final";
  if (game.period > 4) return "OT";
  if (game.period > 0) return `Q${game.period}`;
  return "Pre-Game";
}

function gameStatus(
  pool: Pool | null,
  liveGame: EspnLiveGame | null
): { label: string; variant: "live" | "final" | "pregame" | "open" } {
  if (liveGame?.gameCompleted) return { label: "Final", variant: "final" };
  if (liveGame && liveGame.period > 0)
    return { label: "Live", variant: "live" };
  if (pool?.status === "open")
    return { label: "Open", variant: "open" };
  return { label: "Pre-Game", variant: "pregame" };
}

export default function HeroScoreboard({ pool, liveGame }: HeroScoreboardProps) {
  const awayTeam = liveGame?.awayTeam ?? pool?.awayTeam ?? "Away";
  const homeTeam = liveGame?.homeTeam ?? pool?.homeTeam ?? "Home";
  const awayScore = liveGame?.awayScore ?? 0;
  const homeScore = liveGame?.homeScore ?? 0;
  const isLive = liveGame && !liveGame.gameCompleted && liveGame.period > 0;
  const sport = pool ? getSportLabel(pool.espnSport) : "Sports";
  const clock = liveGame?.statusDetail ?? "—";
  const meta = pool ? parsePoolDisplayMeta(pool.name) : null;
  const status = gameStatus(pool, liveGame);
  const showKickoff = !isLive && !liveGame?.gameCompleted && meta;

  return (
    <div className="hero-scoreboard-v2 hero-scoreboard-enter sb-glow-scoreboard">
      <span className="hero-scoreboard-v2-shimmer" aria-hidden />
      <div className="hero-scoreboard-v2-header">
        <div className="flex items-center gap-2 flex-wrap">
          {isLive && (
            <span className="hero-live-badge">
              <span className="hero-live-dot" aria-hidden />
              LIVE
            </span>
          )}
          <span className="hero-scoreboard-sport">{sport}</span>
          <span className={`hero-status-chip hero-status-${status.variant}`}>
            {status.label}
          </span>
        </div>
        <div className="hero-scoreboard-meta">
          <span>{periodLabel(liveGame)}</span>
          {clock !== "—" && (
            <>
              <span className="text-white/20">·</span>
              <span>{clock}</span>
            </>
          )}
        </div>
      </div>

      <div className="hero-scoreboard-v2-body">
        <div className="hero-scoreboard-v2-team">
          <HeroTeamLogo name={awayTeam} size="lg" />
          <div className="hero-scoreboard-v2-team-text">
            <span className="hero-scoreboard-v2-abbr">{teamAbbrev(awayTeam)}</span>
            <span className="hero-scoreboard-v2-name">{awayTeam}</span>
          </div>
        </div>

        <div className="hero-scoreboard-v2-center">
          <div
            className={[
              "hero-scoreboard-v2-scores",
              isLive ? "hero-scoreboard-v2-scores-live" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="hero-scoreboard-score" key={`away-${awayScore}`}>
              {awayScore}
            </span>
            <span className="hero-scoreboard-divider" />
            <span className="hero-scoreboard-score" key={`home-${homeScore}`}>
              {homeScore}
            </span>
          </div>
        </div>

        <div className="hero-scoreboard-v2-team hero-scoreboard-v2-team-right">
          <div className="hero-scoreboard-v2-team-text">
            <span className="hero-scoreboard-v2-abbr">{teamAbbrev(homeTeam)}</span>
            <span className="hero-scoreboard-v2-name">{homeTeam}</span>
          </div>
          <HeroTeamLogo name={homeTeam} size="lg" />
        </div>
      </div>

      {showKickoff && meta && (
        <div className="hero-kickoff-bar hero-kickoff-bar-live">
          <Clock className="w-3.5 h-3.5 text-sb-glow shrink-0" strokeWidth={2} />
          <span>
            Kickoff {meta.kickoffTime}
            {meta.gameDate !== "Date TBD" && (
              <span className="text-sb-muted"> · {meta.gameDate}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
