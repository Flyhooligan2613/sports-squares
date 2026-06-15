"use client";

import Link from "next/link";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import { useEffect, useState } from "react";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { NowHappeningCard } from "@/lib/actionCenter/types";

const POLL_MS = 5_000;

function LiveGameRow({ card }: { card: NowHappeningCard }) {
  const isLive = card.status === "live";
  const countdown = useKickoffCountdown(card.kickoffAt, isLive);
  const showLive = isLive || countdown.isLive;
  const href = card.openBoard?.poolId
    ? `/pool/${card.openBoard.poolId}`
    : `/games/${card.sport}`;

  return (
    <li>
      <Link
        href={href}
        className={[
          "lwc-activity-event flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.04]",
          showLive ? "lwc-activity-accent-red" : "lwc-activity-accent-blue",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 shrink-0">
          <HeroTeamLogo name={card.awayTeam} size="sm" />
          <HeroTeamLogo name={card.homeTeam} size="sm" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sb-muted">
              {card.sportLabel}
            </span>
            {showLive ? (
              <span className="lwc-live-pill py-0.5 px-1.5 text-[9px]">
                <span className="lwc-live-dot" />
                LIVE
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {card.awayTeam} vs {card.homeTeam}
          </p>
          {showLive && card.homeScore !== null && card.awayScore !== null ? (
            <p className="text-xs text-sb-muted mt-0.5">
              {card.awayScore}–{card.homeScore}
              {card.periodLabel ? ` · ${card.periodLabel}` : ""}
              {card.clockLabel ? ` · ${card.clockLabel}` : ""}
            </p>
          ) : (
            <p className="text-xs text-sb-muted mt-0.5">
              Kickoff in{" "}
              <span className="text-white font-semibold tabular-nums">{countdown.label}</span>
              {card.openBoard
                ? ` · Board ${card.openBoard.boardIndex} · ${card.openBoard.squaresRemaining} left`
                : ""}
            </p>
          )}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-sb-muted shrink-0">
          {showLive ? "Live" : countdown.label}
        </span>
      </Link>
    </li>
  );
}

export default function HomeLiveGamesFeed() {
  const [cards, setCards] = useState<NowHappeningCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/action-center", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { nowHappening: NowHappeningCard[]; updatedAt: string };
        setCards(json.nowHappening ?? []);
        setUpdatedAt(json.updatedAt ?? null);
      } catch {
        // keep last snapshot
      } finally {
        setLoading(false);
      }
    }

    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  if (loading && !cards.length) {
    return (
      <LandingGlassCard className="p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="sb-xp-skeleton h-14 rounded-xl" />
        ))}
      </LandingGlassCard>
    );
  }

  if (!cards.length) {
    return (
      <LandingGlassCard className="p-8 text-center">
        <p className="text-white font-semibold mb-2">No games this week yet</p>
        <p className="text-sb-muted text-sm">
          Boards open automatically as kickoff approaches.
        </p>
      </LandingGlassCard>
    );
  }

  return (
    <div>
      <LandingGlassCard className="lwc-activity-panel p-2 sm:p-3">
        <ul className="lwc-activity-scroll space-y-1">
          {cards.map((card) => (
            <LiveGameRow key={card.gameId} card={card} />
          ))}
        </ul>
      </LandingGlassCard>
      <p className="text-center mt-5 text-xs text-sb-muted">
        {updatedAt
          ? `Updated ${new Date(updatedAt).toLocaleTimeString()} · refreshes every ${POLL_MS / 1000}s`
          : null}
        {" · "}
        <Link
          href="/contest-center"
          className="text-sm font-medium text-emerald-400/90 hover:text-emerald-300 transition-colors"
        >
          Open {PLATFORM_TERMS.contestCenter} →
        </Link>
      </p>
    </div>
  );
}
