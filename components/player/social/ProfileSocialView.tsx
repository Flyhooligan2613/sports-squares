"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import PickPostCard from "@/components/huddle/PickPostCard";
import { Button } from "@/components/ui/Button";
import { CREATOR_LEVEL_LABELS } from "@/lib/huddle/types";
import { publicProfilePath } from "@/lib/player/slug";
import type { PlayerSocialProfile } from "@/lib/huddle/profileSocial";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function FollowButton({
  slug,
  initialFollowing,
  onChange,
}: {
  slug: string;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
}) {
  const [following, setFollowing] = useState(initialFollowing);
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
    if (res.ok) {
      const next = !following;
      setFollowing(next);
      onChange?.(next);
    }
  }

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="sm"
      disabled={loading}
      className={following ? "" : "player-btn-glow"}
      onClick={() => void toggle()}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}

function FollowListModal({
  title,
  users,
  onClose,
}: {
  title: string;
  users: PlayerSocialProfile["followers"];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-sb-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="font-semibold text-white">{title}</h3>
          <button type="button" className="text-sb-muted hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        <ul className="overflow-y-auto max-h-[60vh] divide-y divide-white/5">
          {users.length === 0 ? (
            <li className="p-6 text-center text-sm text-sb-muted">No one here yet.</li>
          ) : (
            users.map((user) => (
              <li key={user.email}>
                <Link
                  href={`/player/${user.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  onClick={onClose}
                >
                  <span className="text-2xl">{user.avatarEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-sb-muted">
                      {user.tierName} · {formatCount(user.followerCount)} followers
                    </p>
                  </div>
                  {user.isVerified ? <span className="text-sky-400 text-xs">✓</span> : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default function ProfileSocialView({
  profile,
  embedded = false,
}: {
  profile: PublicPlayerProfile;
  embedded?: boolean;
}) {
  const [social, setSocial] = useState<PlayerSocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState<"followers" | "following" | null>(null);
  const [followerCount, setFollowerCount] = useState(profile.followerCount ?? 0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/huddle/profile/${profile.slug}`, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as PlayerSocialProfile;
      setSocial(json);
      setFollowerCount(json.followerCount);
    }
    setLoading(false);
  }, [profile.slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const tierVisual = getTierVisual(
    (social?.summary.tierSlug ?? profile.tierSlug ?? "rookie") as import("@/lib/platform/ecosystem/types").PlayerTierSlug
  );

  const pickCount = social?.pickPostCount ?? 0;
  const followingCount = social?.followingCount ?? profile.followingCount ?? 0;
  const winCount = social?.winHighlights.length ?? profile.stats.lifetimeWins;

  return (
    <>
      {/* Instagram-style profile header */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start">
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-2 border-purple-500/40 bg-gradient-to-br from-purple-900/40 to-sb-card shadow-[0_0_40px_rgba(139,92,246,0.25)]"
            >
              {profile.avatarEmoji ?? "🎲"}
            </div>
            {profile.isVerified ? (
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center border-2 border-sb-card">
                ✓
              </span>
            ) : null}
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.displayName}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {!profile.isOwner ? (
                  <FollowButton
                    slug={profile.slug}
                    initialFollowing={social?.viewerIsFollowing ?? profile.viewerIsFollowing ?? false}
                    onChange={(following) =>
                      setFollowerCount((c) => Math.max(0, c + (following ? 1 : -1)))
                    }
                  />
                ) : (
                  <Button
                    href={embedded ? "#settings" : `${publicProfilePath(profile.slug)}#settings`}
                    variant="secondary"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                )}
                <Button href="/huddle" variant="ghost" size="sm">
                  The Huddle
                </Button>
              </div>
            </div>

            {/* Stats row — IG/TikTok style */}
            <div className="flex justify-center sm:justify-start gap-8 sm:gap-10 mb-4">
              <StatBlock label="Wins" value={winCount} />
              <button
                type="button"
                className="text-center group"
                onClick={() => setListModal("followers")}
              >
                <p className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {formatCount(followerCount)}
                </p>
                <p className="text-xs text-sb-muted uppercase tracking-wider">Followers</p>
              </button>
              <button
                type="button"
                className="text-center group"
                onClick={() => setListModal("following")}
              >
                <p className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {formatCount(followingCount)}
                </p>
                <p className="text-xs text-sb-muted uppercase tracking-wider">Following</p>
              </button>
              <StatBlock label="Pick Cards" value={pickCount} />
            </div>

            {profile.playerId ? (
              <p className="text-xs text-purple-300/80 font-mono mb-1">{profile.playerId}</p>
            ) : null}
            <p className="text-sm text-white font-medium">
              {tierVisual.icon} {profile.tierName ?? "Rookie"}
              {social?.summary.creatorLevel
                ? ` · ${CREATOR_LEVEL_LABELS[social.summary.creatorLevel]}`
                : null}
            </p>
            {profile.bio ? (
              <p className="text-sm text-sb-muted mt-2 max-w-lg whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="text-sm text-sb-muted mt-2">{profile.headline}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-sb-muted">
              {profile.pickAccuracyPct != null ? (
                <span className="rounded-full bg-white/5 px-2.5 py-1">🎯 {profile.pickAccuracyPct}% accuracy</span>
              ) : null}
              {(profile.communityReputation ?? 0) > 0 ? (
                <span className="rounded-full bg-white/5 px-2.5 py-1">
                  ⭐ {formatCount(profile.communityReputation!)} rep
                </span>
              ) : null}
              {profile.favoriteTeam ? (
                <span className="rounded-full bg-white/5 px-2.5 py-1">🏈 {profile.favoriteTeam}</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Highlight stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        <MiniStat label="Lifetime $" value={`$${profile.stats.lifetimeWinnings.toLocaleString()}`} />
        <MiniStat label="Win Streak" value={String(profile.stats.currentWinStreak)} />
        <MiniStat label="Best Streak" value={String(profile.stats.longestWinStreak)} />
        <MiniStat label="Boards" value={String(profile.stats.boardsPlayed)} />
      </div>

      {/* Social feed */}
      <section>
        <div className="flex items-center gap-4 border-b border-white/10 mb-6 pb-2">
          <span className="text-sm font-semibold text-white border-b-2 border-purple-400 pb-2 -mb-2.5">
            Highlights
          </span>
          <Link href="/huddle" className="text-xs text-sb-muted hover:text-white ml-auto">
            Explore The Huddle →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="sb-xp-skeleton h-24 rounded-2xl max-w-md mx-auto" />
            <BrandedLoadingLabel context="profile" className="text-sb-muted" />
          </div>
        ) : !social?.feed.length ? (
          <LandingGlassCard className="p-10 text-center">
            <p className="text-white font-semibold mb-2">No highlights yet</p>
            <p className="text-sm text-sb-muted mb-4">
              {profile.isOwner
                ? "Win a quarter or publish a Pick card to The Huddle."
                : "This player hasn't posted wins or pick cards yet."}
            </p>
            {profile.isOwner ? (
              <Button href="/pickem/week">Make Picks</Button>
            ) : null}
          </LandingGlassCard>
        ) : (
          <div className="space-y-4">
            {social.feed.map((item) => {
              if (item.type === "win") {
                return (
                  <LandingGlassCard
                    key={item.id}
                    className="p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">🏆</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wider text-amber-300 mb-1">Quarter Win</p>
                        <p className="text-lg font-bold text-white">
                          {item.win.awayTeam} vs {item.win.homeTeam}
                        </p>
                        <p className="text-sm text-sb-muted mt-1">
                          {item.win.periodLabel}
                          {item.win.winningSquare != null ? ` · Square #${item.win.winningSquare}` : ""}
                          {item.win.amount > 0 ? ` · $${item.win.amount.toFixed(0)}` : ""}
                        </p>
                        <p className="text-[10px] text-sb-muted mt-2">
                          {new Date(item.win.wonAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={[
                          "text-[10px] uppercase font-semibold px-2 py-1 rounded-full",
                          item.win.payoutStatus === "paid"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/10 text-sb-muted",
                        ].join(" ")}
                      >
                        {item.win.payoutStatus}
                      </span>
                    </div>
                  </LandingGlassCard>
                );
              }

              if (item.type === "pick_post") {
                return (
                  <PickPostCard key={item.id} post={item.post} onUpdate={() => void load()} />
                );
              }

              return null;
            })}
          </div>
        )}
      </section>

      {listModal === "followers" && social ? (
        <FollowListModal
          title="Followers"
          users={social.followers}
          onClose={() => setListModal(null)}
        />
      ) : null}
      {listModal === "following" && social ? (
        <FollowListModal
          title="Following"
          users={social.following}
          onClose={() => setListModal(null)}
        />
      ) : null}
    </>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{formatCount(value)}</p>
      <p className="text-xs text-sb-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <LandingGlassCard className="p-3 text-center">
      <p className="text-sm font-bold text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-sb-muted uppercase tracking-wider mt-0.5">{label}</p>
    </LandingGlassCard>
  );
}
