"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AppMenuBar from "@/components/nav/AppMenuBar";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/Button";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { useCountUp } from "@/lib/motion/useCountUp";
import { CalendarDays, Copy, Flame, Share2, Trophy } from "lucide-react";
import { useState } from "react";

function FollowButton({
  slug,
  initialFollowing,
}: {
  slug: string;
  initialFollowing?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/huddle/follow", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: following ? "unfollow" : "follow" }),
    });
    setLoading(false);
    if (res.ok) setFollowing(!following);
  }

  return (
    <Button variant="secondary" size="sm" disabled={loading} onClick={() => void toggle()}>
      {following ? "Following" : "+ Follow"}
    </Button>
  );
}

function Stat({
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

export default function PublicPlayerView({
  profile,
}: {
  profile: PublicPlayerProfile;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.displayName} on SquareBoards`,
          text: profile.headline,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <section className="player-legacy-hero relative overflow-hidden rounded-3xl border border-white/10 bg-sb-card/40 p-6 sm:p-8 mb-8">
            <div className="player-hero-glow opacity-60" aria-hidden />
            <div className="relative z-10">
              <p className="text-sb-glow text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                SquareBoards Legacy
              </p>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  {profile.avatarEmoji ? (
                    <span className="text-5xl shrink-0">{profile.avatarEmoji}</span>
                  ) : null}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        {profile.displayName}
                      </h1>
                      {profile.isVerified ? (
                        <span className="text-sky-400 text-sm" title="Verified">✓</span>
                      ) : null}
                    </div>
                    {profile.playerId ? (
                      <p className="text-xs text-sb-muted mt-1">{profile.playerId}</p>
                    ) : null}
                    {profile.tierName ? (
                      <p className="text-sm text-purple-300 mt-1">{profile.tierName}</p>
                    ) : null}
                    <p className="text-sb-muted mt-2">{profile.bio ?? profile.headline}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
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
                  {!profile.isOwner && profile.slug ? (
                    <FollowButton slug={profile.slug} initialFollowing={profile.viewerIsFollowing} />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-sb-muted">
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Member since {formatMemberSince(profile.memberSince)}
                </span>
                {profile.followerCount != null ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    👥 {profile.followerCount} followers
                  </span>
                ) : null}
                {profile.pickAccuracyPct != null ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    🎯 {profile.pickAccuracyPct}% Pick&apos;em accuracy
                  </span>
                ) : null}
                {profile.communityReputation != null && profile.communityReputation > 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    ⭐ Rep {profile.communityReputation.toLocaleString()}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {profile.achievements.length} achievements
                </span>
              </div>
            </div>
          </section>

          {profile.ranks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
                Rankings
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.ranks.map((rank) => (
                  <Link
                    key={rank.title}
                    href="/leaderboards"
                    className="text-sm font-semibold text-sb-glow bg-sb-purple/15 border border-sb-purple/30 rounded-full px-4 py-2 hover:bg-sb-purple/25 transition-colors"
                  >
                    #{rank.rank} {rank.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
              Career Stats
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Stat
                label="Lifetime Winnings"
                value={profile.stats.lifetimeWinnings}
                prefix="$"
                accent="text-sb-gold"
              />
              <Stat
                label="Career Wins"
                value={profile.stats.lifetimeWins}
                accent="text-sb-success"
              />
              <Stat
                label="Boards Played"
                value={profile.stats.boardsPlayed}
                accent="text-sb-glow"
              />
              <Stat
                label="Squares Owned"
                value={profile.stats.totalSquaresPurchased}
                accent="text-white"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
              Streaks
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <LandingGlassCard className="p-5 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-sb-purple/20 border border-sb-purple/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-sb-glow" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {profile.stats.currentWinStreak}
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
                    {profile.stats.longestWinStreak}
                  </p>
                  <p className="text-sb-muted text-sm">Longest win streak</p>
                </div>
              </LandingGlassCard>
            </div>
          </section>

          {profile.achievements.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
                Achievements
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.achievements.map((achievement) => (
                  <LandingGlassCard
                    key={achievement.id}
                    className="p-4 flex items-start gap-3"
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
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {profile.isOwner ? (
              <Button href="/my-games/profile" variant="ghost">
                Edit Private Profile
              </Button>
            ) : (
              <Button href="/games/nfl">Play on SquareBoards</Button>
            )}
            <Button href="/leaderboards" variant="ghost">
              View Leaderboards
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
