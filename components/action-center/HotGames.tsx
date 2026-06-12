"use client";

import Link from "next/link";
import HeroTeamLogo from "@/components/landing/hero/HeroTeamLogo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { ActionGameCard } from "@/lib/actionCenter/types";

interface HotGamesProps {
  games: ActionGameCard[];
}

function badgeLabel(badge: ActionGameCard["hotBadge"]): string {
  if (badge === "hot") return "🔥 HOT";
  if (badge === "trending") return "🔥 TRENDING";
  if (badge === "selling_fast") return "🔥 SELLING FAST";
  return "";
}

export default function HotGames({ games }: HotGamesProps) {
  return (
    <section>
      <h2 className="ac-section-title">Hot Games</h2>
      {games.length === 0 ? (
        <LandingGlassCard className="p-6 text-center">
          <p className="text-sb-muted text-sm">Trending games will rank here automatically.</p>
        </LandingGlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {games.map((game) => (
            <Link
              key={game.gameId}
              href={
                game.openBoard
                  ? `/pool/${game.openBoard.poolId}`
                  : `/games/${game.sport}`
              }
            >
              <LandingGlassCard className="ac-hot-card p-4 admin-stat-enter">
                <div className="flex items-center justify-between gap-2 mb-3">
                  {game.hotBadge ? (
                    <span className="ac-hot-badge">{badgeLabel(game.hotBadge)}</span>
                  ) : (
                    <span className="lwc-sport-chip">{game.sportLabel}</span>
                  )}
                  <span className="text-xs text-sb-muted tabular-nums">
                    Score {game.trendingScore}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <HeroTeamLogo name={game.awayTeam} size="sm" />
                  <p className="text-sm font-bold text-white flex-1 truncate">
                    {game.awayTeam} vs {game.homeTeam}
                  </p>
                  <HeroTeamLogo name={game.homeTeam} size="sm" />
                </div>
                <p className="text-xs text-sb-muted">
                  {game.totalSquaresSold} squares sold · {game.recentPurchases} recent
                  purchases
                  {game.openBoard
                    ? ` · ${game.openBoard.squaresRemaining} left`
                    : ""}
                </p>
              </LandingGlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
