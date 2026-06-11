"use client";

import { teamAbbrev } from "@/lib/landing/useHeroFeaturedPool";
import { getSportLabel } from "@/lib/landing/poolDisplay";
import type { EspnLiveGame, Pool } from "@/lib/types";

interface HeroScoreboardProps {
  pool: Pool | null;
  liveGame: EspnLiveGame | null;
}

function periodLabel(game: EspnLiveGame | null, pool: Pool | null): string {
  if (!game) return "Pre-Game";
  if (game.gameCompleted) return "Final";
  if (game.period > 4) return `OT`;
  if (game.period > 0) return `Q${game.period}`;
  return "Pre-Game";
}

export default function HeroScoreboard({ pool, liveGame }: HeroScoreboardProps) {
  const awayTeam = liveGame?.awayTeam ?? pool?.awayTeam ?? "Away";
  const homeTeam = liveGame?.homeTeam ?? pool?.homeTeam ?? "Home";
  const awayScore = liveGame?.awayScore ?? 0;
  const homeScore = liveGame?.homeScore ?? 0;
  const isLive = liveGame && !liveGame.gameCompleted;
  const sport = pool ? getSportLabel(pool.espnSport) : "Sports";
  const clock = liveGame?.statusDetail ?? (pool ? "Kickoff soon" : "—");

  return (
    <div className="hero-scoreboard hero-scoreboard-enter">
      <div className="hero-scoreboard-header">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="hero-live-badge">
              <span className="hero-live-dot" aria-hidden />
              LIVE
            </span>
          )}
          <span className="hero-scoreboard-sport">{sport}</span>
        </div>
        <div className="hero-scoreboard-meta">
          <span>{periodLabel(liveGame, pool)}</span>
          <span className="text-white/20">·</span>
          <span>{clock}</span>
        </div>
      </div>

      <div className="hero-scoreboard-matchup">
        <div className="hero-scoreboard-team">
          <span className="hero-scoreboard-abbr">{teamAbbrev(awayTeam)}</span>
          <span className="hero-scoreboard-name">{awayTeam}</span>
        </div>

        <div className="hero-scoreboard-scores">
          <span className="hero-scoreboard-score">{awayScore}</span>
          <span className="hero-scoreboard-divider">—</span>
          <span className="hero-scoreboard-score">{homeScore}</span>
        </div>

        <div className="hero-scoreboard-team hero-scoreboard-team-right">
          <span className="hero-scoreboard-abbr">{teamAbbrev(homeTeam)}</span>
          <span className="hero-scoreboard-name">{homeTeam}</span>
        </div>
      </div>
    </div>
  );
}
