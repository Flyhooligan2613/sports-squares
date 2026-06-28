"use client";

import FlipScore from "./FlipScore";
import { formatClock } from "@/lib/live-arena/squareUtils";

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
  scoreFlash: boolean;
  scoreUpdating: boolean;
}

const Q_LABELS: Record<number, string> = {
  1: "1ST",
  2: "2ND",
  3: "3RD",
  4: "4TH",
};

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
  scoreFlash,
  scoreUpdating,
}: ArenaHeaderProps) {
  return (
    <header
      className={[
        "la-header-broadcast la-glass-card",
        scoreFlash ? "la-haptic-shake" : "",
        scoreUpdating ? "la-header-updating" : "",
      ].join(" ")}
    >
      <div className="la-header-top">
        <div className="la-header-live-cluster">
          <span className="la-live-badge">
            <span className="la-live-dot" aria-hidden />
            LIVE
          </span>
          <span className="la-header-q">
            {Q_LABELS[quarter] ?? `${quarter}TH`} · {clock}
          </span>
        </div>
        <div className="la-header-meta">
          <span className="la-header-pool">${prizePool.toLocaleString()}</span>
          <span className="la-header-type">{contestType}</span>
        </div>
      </div>

      <p className="la-header-matchup">
        {awayTeam} <span className="la-header-vs">vs</span> {homeTeam}
      </p>

      <div className="la-scoreboard">
        <div className="la-score-team">
          <span className="la-score-abbr">{awayAbbr}</span>
          <span className="la-score-digit">
            <FlipScore value={awayScore} />
          </span>
        </div>
        <div className="la-score-divider" aria-hidden />
        <div className="la-score-team la-score-team--home">
          <span className="la-score-abbr">{homeAbbr}</span>
          <span className="la-score-digit">
            <FlipScore value={homeScore} />
          </span>
        </div>
      </div>

      <p className="la-header-clock-sub">{formatClock(quarter, clock)}</p>
    </header>
  );
}
