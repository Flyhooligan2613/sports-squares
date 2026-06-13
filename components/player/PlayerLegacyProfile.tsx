"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import UsernameSettings from "@/components/player/UsernameSettings";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";
import type { PlayerLegacyData } from "@/lib/player/legacyTypes";
import { useCountUp } from "@/lib/motion/useCountUp";
import {
  CalendarDays,
  Copy,
  Flame,
  Grid3X3,
  Share2,
  Trophy,
  Wallet,
} from "lucide-react";

function LegacyStat({
  label,
  value,
  prefix = "",
  accent,
}: {
  label: string;
  value: number;
  prefix?: string;
  accent: string;
}) {
  const animated = useCountUp(value, true, { duration: 900 });
  return (
    <div className="player-stat-tile">
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${accent}`}>
        {prefix}
        {animated.toLocaleString()}
      </p>
      <p className="text-sb-muted text-xs mt-2 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function PlayerLegacyProfile() {
  const [legacy, setLegacy] = useState<PlayerLegacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/player/legacy", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load profile");
        }
        const json = (await res.json()) as PlayerLegacyData;
        if (!cancelled) setLegacy(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    function handleProfileUpdated() {
      void load();
    }
    window.addEventListener("player-profile-updated", handleProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("player-profile-updated", handleProfileUpdated);
    };
  }, []);

  async function handleShare() {
    const url = legacy?.publicPath
      ? `${window.location.origin}${legacy.publicPath}`
      : window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${legacy?.displayName ?? "My"} SquareBoards Legacy`,
          text: legacy?.headline,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share */
    }
  }

  async function handleSignOut() {
    await signOutPlayer();
    window.location.href = "/my-games/login";
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-5">
        <div className="player-skeleton-card h-40 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="player-skeleton-card h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !legacy) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <LandingGlassCard className="p-8">
          <p className="text-white font-semibold mb-2">Couldn&apos;t load profile</p>
          <p className="text-sb-muted text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </LandingGlassCard>
      </div>
    );
  }

  const unlocked = legacy.achievements.filter((a) => a.unlocked);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section id="legacy" className="player-legacy-hero relative overflow-hidden rounded-3xl border border-white/10 bg-sb-card/40 p-6 sm:p-8 mb-8">
        <div className="player-hero-glow opacity-60" aria-hidden />
        <div className="relative z-10">
          <p className="text-sb-glow text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Player Legacy
          </p>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {legacy.displayName}
              </h1>
              {legacy.profileBio ? (
                <div className="player-bio-banner mt-3">
                  <p className="player-bio-banner-text">{legacy.profileBio}</p>
                </div>
              ) : null}
              <p className="text-sb-muted mt-2">{legacy.headline}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {legacy.publicPath && (
                <Button href={legacy.publicPath} variant="ghost" size="sm">
                  Public Page
                </Button>
              )}
              <Button href="/leaderboards" variant="ghost" size="sm">
                View Rankings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                {copied ? (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-sb-muted">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Member since {formatMemberSince(legacy.memberSince)}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Trophy className="w-3.5 h-3.5" />
              {unlocked.length} achievements
            </span>
            {legacy.publicPath && (
              <Link
                href={legacy.publicPath}
                className="inline-flex items-center gap-1.5 bg-sb-purple/15 border border-sb-purple/30 text-sb-glow rounded-full px-3 py-1 hover:bg-sb-purple/25 transition-colors"
              >
                squareboards.pro{legacy.publicPath}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
          Career Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <LegacyStat
            label="Lifetime Winnings"
            value={legacy.stats.lifetimeWinnings}
            prefix="$"
            accent="text-sb-gold"
          />
          <LegacyStat
            label="Career Wins"
            value={legacy.stats.lifetimeWins}
            accent="text-sb-success"
          />
          <LegacyStat
            label="Boards Played"
            value={legacy.stats.boardsPlayed}
            accent="text-sb-glow"
          />
          <LegacyStat
            label="Squares Owned"
            value={legacy.stats.totalSquaresPurchased}
            accent="text-white"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
          Streaks
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <LandingGlassCard className="p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-sb-purple/20 border border-sb-purple/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-sb-glow" />
            </span>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {legacy.stats.currentWinStreak}
              </p>
              <p className="text-sb-muted text-sm">Current win streak</p>
            </div>
          </LandingGlassCard>
          <LandingGlassCard className="p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-sb-gold/15 border border-sb-gold/25 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-sb-gold" />
            </span>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {legacy.stats.longestWinStreak}
              </p>
              <p className="text-sb-muted text-sm">Longest win streak</p>
            </div>
          </LandingGlassCard>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
          Achievements
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {legacy.achievements.map((achievement) => (
            <LandingGlassCard
              key={achievement.id}
              className={`p-4 flex items-start gap-3 transition-opacity ${
                achievement.unlocked ? "" : "opacity-45"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {achievement.emoji}
              </span>
              <div>
                <p className="font-semibold text-white">{achievement.title}</p>
                <p className="text-sb-muted text-sm">{achievement.description}</p>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <UsernameSettings />

        <LandingGlassCard className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Account
          </h2>
          <p className="text-lg font-medium text-white">{legacy.email}</p>
          <p className="text-sb-muted text-sm mt-2">
            {legacy.stats.seasonsPlayed} season
            {legacy.stats.seasonsPlayed === 1 ? "" : "s"} · {legacy.stats.yearsPlayed}{" "}
            year{legacy.stats.yearsPlayed === 1 ? "" : "s"} on SquareBoards
          </p>
        </LandingGlassCard>

        <LandingGlassCard id="wallet" className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </h2>
          <p className="text-sb-muted text-sm leading-relaxed mb-4">
            Automatic Stripe payouts are coming soon. Your quarter wins will deposit
            directly to the card on file.
          </p>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sb-gold bg-sb-gold/10 border border-sb-gold/25 rounded-full px-3 py-1">
            Coming soon
          </span>
        </LandingGlassCard>

        <Button variant="ghost" onClick={handleSignOut} className="w-full sm:w-auto">
          Sign out
        </Button>
      </section>
    </div>
  );
}
