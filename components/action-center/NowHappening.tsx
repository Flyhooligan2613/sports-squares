"use client";

import Link from "next/link";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { NowHappeningCard } from "@/lib/actionCenter/types";

interface NowHappeningProps {
  cards: NowHappeningCard[];
}

function NowHappeningCardItem({ card }: { card: NowHappeningCard }) {
  const isLive = card.status === "live";
  const countdown = useKickoffCountdown(card.kickoffAt, isLive);
  const showLive = isLive || countdown.isLive;
  const poolId = card.openBoard?.poolId;
  const playHref = poolId ? `/pool/${poolId}` : `/games/${card.sport}`;

  return (
    <LandingGlassCard
      glow
      className={[
        "ac-now-card min-w-[85vw] sm:min-w-[420px] snap-center p-5 sm:p-6",
        showLive ? "ac-now-card-live" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="lwc-sport-chip">{card.sportLabel}</span>
          {showLive ? (
            <span className="lwc-live-pill py-1 px-2 text-[10px]">
              <span className="lwc-live-dot" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sb-muted">
              Kickoff in{" "}
              <span className="text-white tabular-nums ac-countdown-pulse">{countdown.label}</span>
            </span>
          )}
        </div>
        {card.hotBadge ? (
          <span className="ac-hot-badge">{card.hotBadge.replace("_", " ")}</span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <HeroTeamLogo name={card.awayTeam} size="md" />
        <div className="flex-1 text-center min-w-0">
          <p className="text-lg font-bold text-white truncate">{card.awayTeam}</p>
          {showLive && card.homeScore !== null && card.awayScore !== null ? (
            <p className="text-2xl font-bold text-white tabular-nums my-1">
              {card.awayScore} – {card.homeScore}
            </p>
          ) : (
            <p className="text-sm text-sb-muted my-1">vs</p>
          )}
          <p className="text-lg font-bold text-white truncate">{card.homeTeam}</p>
        </div>
        <HeroTeamLogo name={card.homeTeam} size="md" />
      </div>

      {showLive ? (
        <div className="ac-now-meta mb-4">
          <p className="text-sm font-semibold text-white">
            {card.periodLabel ?? "Live"}
          </p>
          {card.clockLabel ? (
            <p className="text-xs text-sb-muted">{card.clockLabel}</p>
          ) : null}
          {card.openBoard ? (
            <p className="text-sm text-sb-muted mt-1">
              Board {card.openBoard.boardIndex} · Only {card.openBoard.squaresRemaining}{" "}
              squares left
            </p>
          ) : null}
        </div>
      ) : (
        <div className="ac-now-meta mb-4">
          <p className="text-xs uppercase tracking-wider text-sb-muted">
            {card.featuredReason === "filling_fast" ? "Board Filling Fast" : "Starts"}
          </p>
          <p className="text-2xl font-bold text-white tabular-nums ac-countdown-pulse">
            {countdown.label}
          </p>
          {card.openBoard ? (
            <p className="text-sm text-sb-muted mt-1">
              {card.openBoard.squaresSold} squares sold · Board {card.openBoard.boardIndex}
            </p>
          ) : (
            <p className="text-sm text-sb-muted mt-1">This week&apos;s slate</p>
          )}
        </div>
      )}

      <Link href={playHref}>
        <Button className="w-full ac-btn-play">{card.ctaLabel}</Button>
      </Link>
    </LandingGlassCard>
  );
}

export default function NowHappening({ cards }: NowHappeningProps) {
  if (!cards.length) {
    return (
      <section>
        <h2 className="ac-section-title">Now Happening</h2>
        <p className="text-xs text-sb-muted mb-4">This week&apos;s games · updates every 5 seconds</p>
        <LandingGlassCard className="p-8 text-center">
          <p className="text-white font-semibold mb-2">No games this week yet</p>
          <p className="text-sb-muted text-sm">
            Check back as kickoff approaches — boards open automatically.
          </p>
        </LandingGlassCard>
      </section>
    );
  }

  const liveCount = cards.filter((c) => c.status === "live").length;

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="ac-section-title mb-1">Now Happening</h2>
          <p className="text-xs text-sb-muted">
            This week&apos;s games · {liveCount > 0 ? `${liveCount} live` : "kickoff countdowns"} ·
            refreshes every 5s
          </p>
        </div>
      </div>
      <div className="ac-carousel flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {cards.map((card) => (
          <NowHappeningCardItem key={card.gameId} card={card} />
        ))}
      </div>
    </section>
  );
}
