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
  const countdown = useKickoffCountdown(
    card.kickoffAt,
    card.status === "live"
  );
  const poolId = card.openBoard?.poolId;

  return (
    <LandingGlassCard
      glow
      className={[
        "ac-now-card min-w-[85vw] sm:min-w-[420px] snap-center p-5 sm:p-6",
        card.status === "live" || countdown.isLive ? "ac-now-card-live" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="lwc-sport-chip">{card.sportLabel}</span>
          {(card.status === "live" || countdown.isLive) && (
            <span className="lwc-live-pill py-1 px-2 text-[10px]">
              <span className="lwc-live-dot" />
              LIVE
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
          {card.homeScore !== null && card.awayScore !== null ? (
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

      {card.status === "live" || countdown.isLive ? (
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
            {card.featuredReason === "filling_fast" ? "Board Filling Fast" : "Tipoff in"}
          </p>
          <p className="text-2xl font-bold text-white ac-countdown-pulse">
            {countdown.label}
          </p>
          {card.openBoard ? (
            <p className="text-sm text-sb-muted mt-1">
              {card.openBoard.squaresSold} squares sold · Board {card.openBoard.boardIndex}
            </p>
          ) : null}
        </div>
      )}

      {poolId ? (
        <Link href={`/pool/${poolId}`}>
          <Button className="w-full ac-btn-play">{card.ctaLabel}</Button>
        </Link>
      ) : null}
    </LandingGlassCard>
  );
}

export default function NowHappening({ cards }: NowHappeningProps) {
  if (!cards.length) {
    return (
      <section>
        <h2 className="ac-section-title">Now Happening</h2>
        <LandingGlassCard className="p-8 text-center">
          <p className="text-white font-semibold mb-2">Games loading soon</p>
          <p className="text-sb-muted text-sm">
            Check back as kickoff approaches — boards open automatically.
          </p>
        </LandingGlassCard>
      </section>
    );
  }

  return (
    <section>
      <h2 className="ac-section-title">Now Happening</h2>
      <div className="ac-carousel flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {cards.map((card) => (
          <NowHappeningCardItem key={card.gameId} card={card} />
        ))}
      </div>
    </section>
  );
}
