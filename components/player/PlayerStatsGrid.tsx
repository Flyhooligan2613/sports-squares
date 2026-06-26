import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { COMMUNITY_LABELS } from "@/lib/platform/language";
import Link from "next/link";

function winRate(stats: PublicPlayerProfile["stats"]): string {
  if (stats.boardsPlayed <= 0) return "—";
  return `${Math.round((stats.lifetimeWins / stats.boardsPlayed) * 100)}%`;
}

interface PlayerStatsGridProps {
  profile: PublicPlayerProfile;
}

export default function PlayerStatsGrid({ profile }: PlayerStatsGridProps) {
  const { stats, ranks, tierName } = profile;
  const seasonRank = ranks[0] ? `#${ranks[0].rank}` : "—";

  const tiles = [
    { label: "Contests", value: String(stats.boardsPlayed), emoji: "🎯" },
    { label: "Won", value: String(stats.lifetimeWins), emoji: "🏆" },
    { label: "Win %", value: winRate(stats), emoji: "📈" },
    { label: "Squares", value: String(stats.totalSquaresPurchased), emoji: "🎲" },
    { label: "Streak", value: String(stats.currentWinStreak), emoji: "⚡" },
    { label: "Best Streak", value: String(stats.longestWinStreak), emoji: "👑" },
    { label: "Season Rank", value: seasonRank, emoji: "🏅", href: "/leaderboards" },
    { label: "Reward Tier", value: tierName ?? "Rookie", emoji: "⭐" },
  ];

  return (
    <section aria-label="Player statistics" className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        Competition Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tiles.map((tile) => {
          const inner = (
            <>
              <span className="text-lg mb-1" aria-hidden>
                {tile.emoji}
              </span>
              <p className="text-base sm:text-lg font-bold text-white tabular-nums sb-balance-increment">
                {tile.value}
              </p>
              <p className="text-[10px] text-sb-muted uppercase tracking-wider mt-0.5">
                {tile.label}
              </p>
            </>
          );

          if (tile.href) {
            return (
              <Link key={tile.label} href={tile.href} className="block sb-card-lift">
                <LandingGlassCard className="p-3 text-center h-full hover:border-sb-purple/30 transition-colors">
                  {inner}
                </LandingGlassCard>
              </Link>
            );
          }

          return (
            <LandingGlassCard key={tile.label} className="p-3 text-center sb-card-lift">
              {inner}
            </LandingGlassCard>
          );
        })}
      </div>
      {ranks.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-4 text-xs">
          {ranks.slice(0, 3).map((rank) => (
            <Link
              key={rank.title}
              href="/leaderboards"
              className="rounded-full border border-sb-purple/30 bg-sb-purple/10 px-3 py-1.5 text-purple-200 hover:bg-sb-purple/20 transition-colors"
            >
              #{rank.rank} {rank.title}
            </Link>
          ))}
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sb-muted">
            {COMMUNITY_LABELS.competitionRankings}
          </span>
        </div>
      ) : null}
    </section>
  );
}
