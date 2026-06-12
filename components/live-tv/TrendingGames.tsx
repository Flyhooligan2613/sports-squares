"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { LiveTvTrendingGame } from "@/lib/liveTv/types";

interface TrendingGamesProps {
  games: LiveTvTrendingGame[];
}

function badgeLabel(badge: LiveTvTrendingGame["badge"]): string {
  if (badge === "fast_filling") return "⚡ FAST FILLING";
  if (badge === "most_played") return "👑 MOST PLAYED";
  return "🔥 HOT";
}

export default function TrendingGames({ games }: TrendingGamesProps) {
  return (
    <section>
      <h2 className="livetv-section-title">Trending Games</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {games.map((game) => (
          <Link
            key={game.gameId}
            href={game.poolId ? `/pool/${game.poolId}` : `/games/${game.sport}`}
          >
            <LandingGlassCard className="livetv-trend-card p-4">
              <span className="ac-hot-badge mb-2 inline-flex">{badgeLabel(game.badge)}</span>
              <p className="text-base font-bold text-white">
                {game.awayTeam} vs {game.homeTeam}
              </p>
              <p className="text-xs text-sb-muted mt-1">
                {game.fillPercent}% full · {game.recentPurchases} recent purchases · Score{" "}
                {game.trendingScore}
              </p>
            </LandingGlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
