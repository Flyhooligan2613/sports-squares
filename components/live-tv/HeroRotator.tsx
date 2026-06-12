"use client";

import { useEffect, useState } from "react";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { LiveTvHeroCard } from "@/lib/liveTv/types";

interface HeroRotatorProps {
  cards: LiveTvHeroCard[];
}

const CYCLE_MS = 12_000;

function HeroCardContent({ card }: { card: LiveTvHeroCard }) {
  const countdown = useKickoffCountdown(
    card.kickoffAt ?? new Date().toISOString(),
    card.kind === "live"
  );

  return (
    <div className="livetv-hero-inner">
      <div className="flex items-center gap-3 mb-5">
        <HeroTeamLogo name={card.awayTeam} size="lg" />
        <div className="text-center flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sb-glow mb-1">
            {card.kind === "live"
              ? "🏈 LIVE"
              : card.kind === "starting_soon"
                ? "🏀 STARTING SOON"
                : "🏆 JUST PAID"}
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white truncate">
            {card.awayTeam}{" "}
            <span className="text-sb-muted font-normal">vs</span> {card.homeTeam}
          </h2>
          <p className="text-sm text-sb-muted mt-1">{card.sportLabel}</p>
        </div>
        <HeroTeamLogo name={card.homeTeam} size="lg" />
      </div>

      {card.kind === "live" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="livetv-stat-label">Period</p>
            <p className="livetv-stat-value">{card.periodLabel ?? "Live"}</p>
          </div>
          <div>
            <p className="livetv-stat-label">Clock</p>
            <p className="livetv-stat-value">{card.clockLabel ?? "—"}</p>
          </div>
          <div>
            <p className="livetv-stat-label">Board</p>
            <p className="livetv-stat-value">#{card.boardIndex ?? "—"}</p>
          </div>
          <div>
            <p className="livetv-stat-label">Squares Left</p>
            <p className="livetv-stat-value text-sb-gold">
              {card.squaresRemaining ?? "—"}
            </p>
          </div>
        </div>
      ) : null}

      {card.kind === "starting_soon" ? (
        <div className="text-center py-2">
          <p className="livetv-stat-label">Tipoff</p>
          <p className="text-3xl sm:text-5xl font-bold text-white livetv-countdown-glow">
            {countdown.label}
          </p>
          <p className="text-sm text-sb-muted mt-2">Board Filling Fast</p>
        </div>
      ) : null}

      {card.kind === "just_paid" ? (
        <div className="text-center py-2">
          <p className="text-sm text-sb-muted">{card.periodWon}</p>
          <p className="text-xl font-bold text-white mt-1">{card.winnerName}</p>
          <p className="text-4xl sm:text-5xl font-bold text-sb-gold tabular-nums mt-2">
            {formatCurrency(card.winAmount ?? 0)}
          </p>
          <p className="text-sm text-sb-success font-semibold mt-2">
            Paid Automatically · Board #{card.boardIndex}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function HeroRotator({ cards }: HeroRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (cards.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % cards.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [cards.length]);

  if (!cards.length) {
    return (
      <LandingGlassCard glow className="livetv-hero p-8 text-center">
        <p className="text-white font-semibold text-xl">SquareBoards LIVE TV</p>
        <p className="text-sb-muted mt-2">Waiting for the next game moment…</p>
      </LandingGlassCard>
    );
  }

  const card = cards[index];

  return (
    <LandingGlassCard glow className="livetv-hero p-6 sm:p-8 relative overflow-hidden">
      <div className="livetv-hero-shimmer" aria-hidden />
      <div key={card.id} className="livetv-hero-slide relative z-10">
        <HeroCardContent card={card} />
      </div>
      {cards.length > 1 ? (
        <div className="flex justify-center gap-2 mt-6 relative z-10">
          {cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Show hero card ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "w-2 h-2 rounded-full transition-all",
                i === index ? "bg-sb-glow w-6" : "bg-white/25",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </LandingGlassCard>
  );
}
