"use client";

import { useCallback, useRef } from "react";
import type { ContestCenterStats, LiveContestSummary } from "@/lib/live-arena/types";

interface ContestCenterDashboardProps {
  stats: ContestCenterStats;
  contests: LiveContestSummary[];
  activeIndex: number;
  onChange: (index: number) => void;
  onJoinContest: () => void;
}

const SPORT_ICONS: Record<string, string> = {
  nfl: "🏈",
  nba: "🏀",
  mlb: "⚾",
  pickem: "📋",
};

const STATUS_LABELS: Record<LiveContestSummary["userStatus"], string> = {
  winning: "Winning",
  active: "Active",
  "in-play": "In Play",
  watching: "Watching",
  upcoming: "Upcoming",
};

export default function ContestCenterDashboard({
  stats,
  contests,
  activeIndex,
  onChange,
  onJoinContest,
}: ContestCenterDashboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });

  const scrollToIndex = useCallback(
    (idx: number, smooth = true) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ left: idx * el.offsetWidth, behavior: smooth ? "smooth" : "auto" });
    },
    []
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = touchStart.current.y - e.changedTouches[0].clientY;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 40) return;
    if (dx > 0 && activeIndex < contests.length - 1) onChange(activeIndex + 1);
    else if (dx < 0 && activeIndex > 0) onChange(activeIndex - 1);
    else scrollToIndex(activeIndex);
  };

  const active = contests[activeIndex];

  return (
    <div className="la-contest-center space-y-4">
      {/* Command center header */}
      <header className="la-contest-center__hero la-glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="la-live-badge">
            <span className="la-live-dot" aria-hidden />
            LIVE NOW
          </span>
          <span className="text-xs font-semibold text-white/70">
            {stats.activeContests} Active Contests
          </span>
        </div>

        <div className="la-contest-center__stats">
          <StatTile label="Potential Winnings" value={`$${stats.potentialWinnings.toLocaleString()}`} highlight />
          <StatTile label="Wallet Balance" value={`$${stats.walletBalance.toLocaleString()}`} />
          <StatTile label="Winning Boards" value={String(stats.winningBoards)} />
          <StatTile label="Upcoming Games" value={String(stats.upcomingGames)} />
          <StatTile label="Competition History" value={String(stats.contestHistoryCount)} />
        </div>
      </header>

      {/* Contest cards carousel */}
      <div
        ref={scrollRef}
        className="la-carousel-track -mx-4 px-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {contests.map((c, i) => (
          <div
            key={c.id}
            className={[
              "la-carousel-slide",
              i === activeIndex ? "la-carousel-slide--active" : "la-carousel-slide--inactive",
            ].join(" ")}
          >
            <article
              className={[
                "la-contest-card la-glass-card",
                c.isLive ? "la-contest-card--live" : "",
                c.userStatus === "winning" ? "la-contest-card--winning" : "",
              ].join(" ")}
            >
              <div className="la-contest-card__header">
                <span className="la-contest-card__league" aria-hidden>
                  {SPORT_ICONS[c.sport] ?? "🏟"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="la-contest-card__matchup truncate">
                    {c.awayTeam} vs {c.homeTeam}
                  </p>
                  <p className="la-contest-card__meta">{c.contestType}</p>
                </div>
                {c.isLive ? (
                  <span className="la-live-badge shrink-0">LIVE</span>
                ) : (
                  <span className="text-[10px] text-sb-muted shrink-0 uppercase tracking-wider">
                    Soon
                  </span>
                )}
              </div>

              {c.isLive && c.awayScore != null && c.homeScore != null ? (
                <div className="la-contest-card__scoreboard">
                  <div className="la-contest-card__team">
                    <span className="la-contest-card__abbr">{c.awayAbbr}</span>
                    <span className="la-contest-card__score tabular-nums">{c.awayScore}</span>
                  </div>
                  <div className="la-contest-card__clock">
                    <span className="tabular-nums">Q{c.quarter}</span>
                    <span className="tabular-nums">{c.clock}</span>
                  </div>
                  <div className="la-contest-card__team la-contest-card__team--home">
                    <span className="la-contest-card__abbr">{c.homeAbbr}</span>
                    <span className="la-contest-card__score tabular-nums">{c.homeScore}</span>
                  </div>
                </div>
              ) : (
                <p className="la-contest-card__upcoming text-xs text-sb-muted py-3 text-center">
                  Starts {c.startTime ?? "TBD"}
                </p>
              )}

              <div className="la-contest-card__footer">
                <div>
                  <p className="text-[10px] text-sb-muted uppercase tracking-wider">Prize Pool</p>
                  <p className="text-sm font-bold text-sb-gold tabular-nums">
                    ${c.prizePool.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-sb-muted uppercase tracking-wider">Your Status</p>
                  <p
                    className={[
                      "text-sm font-semibold",
                      c.userStatus === "winning" ? "text-amber-400" : "text-blue-300",
                    ].join(" ")}
                  >
                    {STATUS_LABELS[c.userStatus]}
                  </p>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5">
        {contests.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`${c.awayTeam} vs ${c.homeTeam}`}
            aria-current={i === activeIndex ? "true" : undefined}
            onClick={() => onChange(i)}
            className={[
              "la-carousel-dot h-1.5 rounded-full bg-white/20 w-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center",
              i === activeIndex ? "la-carousel-dot-active" : "",
            ].join(" ")}
          >
            <span className="sr-only">Slide {i + 1}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onJoinContest}
        className="la-contest-center__join w-full min-h-[48px] rounded-xl font-bold text-sm tracking-wide"
      >
        {active?.isLive ? "Enter Live Arena" : "View Contest"}
      </button>
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="la-contest-center__stat">
      <p className="la-contest-center__stat-label">{label}</p>
      <p
        className={[
          "la-contest-center__stat-value tabular-nums",
          highlight ? "text-sb-gold" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
