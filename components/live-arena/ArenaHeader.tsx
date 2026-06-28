"use client";

import { useCallback, useRef, type CSSProperties } from "react";
import FlipScore from "./FlipScore";
import { getTeamBadge } from "@/lib/live-arena/mockData";

interface ArenaHeaderProps {
  awayTeam: string;
  awayAbbr: string;
  homeTeam: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  quarter: number;
  clock: string;
  prizePool: number;
  contestType: string;
  possessionTeam?: "away" | "home" | null;
  scoreFlash: boolean;
  scoreUpdating: boolean;
  hapticClass?: string;
  onLongPress?: () => void;
}

const Q_LABELS: Record<number, string> = {
  1: "1ST",
  2: "2ND",
  3: "3RD",
  4: "4TH",
};

function TeamBadge({
  abbr,
  team,
  score,
  side,
  hasPossession,
}: {
  abbr: string;
  team: string;
  score: number;
  side: "away" | "home";
  hasPossession: boolean;
}) {
  const badge = getTeamBadge(abbr);

  return (
    <div
      className={[
        "la-broadcast-team",
        side === "home" ? "la-broadcast-team--home" : "",
        hasPossession ? "la-broadcast-team--possession" : "",
      ].join(" ")}
    >
      <div
        className="la-broadcast-logo"
        style={
          {
            "--team-primary": badge.primary,
            "--team-accent": badge.accent,
          } as CSSProperties
        }
        aria-hidden
      >
        <span className="la-broadcast-logo__emoji">{badge.emoji}</span>
        <span className="la-broadcast-logo__abbr">{abbr}</span>
      </div>
      <span className="la-broadcast-team__name">{team}</span>
      <span className="la-broadcast-score">
        <FlipScore value={score} />
      </span>
      {hasPossession && (
        <span className="la-possession-dot" aria-label="Possession">
          <span className="la-possession-dot__glow" aria-hidden />
          🏈
        </span>
      )}
    </div>
  );
}

export default function ArenaHeader({
  awayTeam,
  awayAbbr,
  homeTeam,
  homeAbbr,
  awayScore,
  homeScore,
  quarter,
  clock,
  prizePool,
  contestType,
  possessionTeam = null,
  scoreFlash,
  scoreUpdating,
  hapticClass = "",
  onLongPress,
}: ArenaHeaderProps) {
  const pressTimer = useRef<number | null>(null);

  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const startPress = useCallback(() => {
    clearPress();
    if (!onLongPress) return;
    pressTimer.current = window.setTimeout(onLongPress, 800);
  }, [clearPress, onLongPress]);

  return (
    <header
      className={[
        "la-header-broadcast la-glass-card la-ui-breathe",
        scoreFlash ? hapticClass || "la-haptic-shake" : "",
        scoreUpdating ? "la-header-updating" : "",
      ].join(" ")}
      onPointerDown={startPress}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
    >
      <div className="la-header-top">
        <div className="la-header-live-cluster">
          <span className="la-live-badge">
            <span className="la-live-dot" aria-hidden />
            LIVE
          </span>
        </div>
        <div className="la-header-clock-block">
          <span className="la-header-q">{Q_LABELS[quarter] ?? `${quarter}TH`}</span>
          <span className="la-header-clock">{clock}</span>
        </div>
        <div className="la-header-meta">
          <span className="la-header-pool">${prizePool.toLocaleString()}</span>
          <span className="la-header-pool-label">PRIZE POOL</span>
        </div>
      </div>

      <div className="la-broadcast-scoreboard">
        <TeamBadge
          abbr={awayAbbr}
          team={awayTeam}
          score={awayScore}
          side="away"
          hasPossession={possessionTeam === "away"}
        />
        <div className="la-broadcast-center" aria-hidden>
          <span className="la-broadcast-vs">VS</span>
        </div>
        <TeamBadge
          abbr={homeAbbr}
          team={homeTeam}
          score={homeScore}
          side="home"
          hasPossession={possessionTeam === "home"}
        />
      </div>

      <p className="la-header-type">{contestType}</p>
    </header>
  );
}
