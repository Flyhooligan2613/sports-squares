"use client";

import Link from "next/link";
import PlayerAvatar from "@/components/player/PlayerAvatar";
import { useCountUp } from "@/lib/motion/useCountUp";
import type { PlayerDashboardStats } from "@/lib/player/dashboardTypes";

interface MyGamesHeroProps {
  displayName: string;
  avatarEmoji?: string;
  profileBio?: string | null;
  needsUsernameSetup?: boolean;
  stats: PlayerDashboardStats;
}

function StatTile({
  label,
  value,
  prefix = "",
  accent,
  delay,
}: {
  label: string;
  value: number;
  prefix?: string;
  accent: string;
  delay: number;
}) {
  const animated = useCountUp(value, true, { duration: 1100, delay });
  return (
    <div className="player-stat-tile admin-stat-enter" style={{ animationDelay: `${delay}ms` }}>
      <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums ${accent}`}>
        {prefix}
        {animated.toLocaleString()}
      </p>
      <p className="text-sb-muted text-xs sm:text-sm mt-2 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function MyGamesHero({
  displayName,
  avatarEmoji,
  profileBio,
  needsUsernameSetup,
  stats,
}: MyGamesHeroProps) {
  const activeLabel =
    stats.activeBoards === 1
      ? "You have 1 active board."
      : `You have ${stats.activeBoards} active boards.`;

  return (
    <section className="player-hero relative overflow-hidden">
      <div className="player-hero-glow" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
        <p className="text-sb-glow text-sm font-semibold uppercase tracking-[0.2em] mb-3 player-hero-enter">
          Player Dashboard
        </p>

        <div className="flex items-center gap-4 mb-3 player-hero-enter player-hero-enter-1">
          <PlayerAvatar emoji={avatarEmoji} size="lg" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Welcome back, {displayName}
          </h1>
        </div>

        {needsUsernameSetup ? (
          <div className="mb-6 rounded-xl border border-sb-purple/40 bg-sb-purple/10 px-4 py-3 player-hero-enter player-hero-enter-2">
            <p className="text-sm text-white">
              Pick a creative username with emoji — your real name never has to show.{" "}
              <Link href="/my-games/profile" className="text-sb-purple-light font-semibold underline-offset-2 hover:underline">
                Set up your profile →
              </Link>
            </p>
          </div>
        ) : null}

        {profileBio ? (
          <div className="player-bio-banner mb-6 player-hero-enter player-hero-enter-2">
            <p className="player-bio-banner-text">{profileBio}</p>
          </div>
        ) : (
          <div className="player-bio-banner player-bio-banner-empty mb-6 player-hero-enter player-hero-enter-2">
            <p className="text-sm text-sb-muted">
              Add a short bio on your{" "}
              <Link href="/my-games/profile" className="text-sb-purple-light hover:underline">
                profile
              </Link>{" "}
              — tell the community who you are.
            </p>
          </div>
        )}

        <p className="text-lg sm:text-xl text-sb-muted mb-10 player-hero-enter player-hero-enter-2">
          {activeLabel}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatTile label="Total Winnings" value={stats.totalWinnings} prefix="$" accent="text-sb-gold" delay={80} />
          <StatTile label="Lifetime Wins" value={stats.lifetimeWins} accent="text-sb-success" delay={160} />
          <StatTile label="Active Boards" value={stats.activeBoards} accent="text-sb-glow" delay={240} />
          <StatTile label="Upcoming Games" value={stats.upcomingGames} accent="text-white" delay={320} />
        </div>
      </div>
    </section>
  );
}
