"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CREATOR_LEVEL_LABELS } from "@/lib/huddle/types";
import type { HuddlePlayerSummary } from "@/lib/huddle/types";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import { publicProfilePath } from "@/lib/player/slug";
import FollowButton from "./FollowButton";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

interface ProfileHeaderProps {
  profile: PublicPlayerProfile;
  followerCount: number;
  followingCount: number;
  winCount: number;
  pickCount: number;
  mutualConnections?: HuddlePlayerSummary[];
  embedded?: boolean;
  onFollowChange?: (following: boolean) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function ProfileHeader({
  profile,
  followerCount,
  followingCount,
  winCount,
  pickCount,
  mutualConnections = [],
  embedded = false,
  onFollowChange,
  onFollowersClick,
  onFollowingClick,
}: ProfileHeaderProps) {
  const tierVisual = getTierVisual((profile.tierSlug ?? "rookie") as PlayerTierSlug);
  const username = profile.username ?? profile.slug.split("-")[0];

  return (
    <header className="mb-8" aria-label="Player profile header">
      {/* Banner strip */}
      <div
        className="relative h-24 sm:h-28 -mx-4 sm:-mx-6 mb-[-3rem] rounded-b-2xl overflow-hidden border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${tierVisual.color}55 0%, rgba(15,15,25,0.9) 70%)`,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-end px-1">
        <div className="relative shrink-0">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl border-2 border-purple-500/40 bg-gradient-to-br from-purple-900/40 to-sb-card shadow-[0_0_40px_rgba(139,92,246,0.25)] ${tierVisual.frameClass}`}
          >
            {profile.avatarEmoji ?? "🎲"}
          </div>
          {profile.isVerified ? (
            <span
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-sky-500 text-white text-sm flex items-center justify-center border-2 border-sb-card"
              aria-label="Verified competitor"
            >
              ✓
            </span>
          ) : null}
        </div>

        <div className="flex-1 w-full text-center sm:text-left pb-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-sm font-mono text-purple-300/90 truncate">@{username}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                {profile.displayName}
              </h1>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              {!profile.isOwner ? (
                <FollowButton
                  slug={profile.slug}
                  initialFollowing={profile.viewerIsFollowing ?? false}
                  displayName={profile.displayName}
                  onChange={onFollowChange}
                />
              ) : (
                <Button
                  href={embedded ? "#settings" : `${publicProfilePath(profile.slug)}#settings`}
                  variant="secondary"
                  size="sm"
                  className="sb-card-lift"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div
            className="flex justify-center sm:justify-start gap-6 sm:gap-8 mb-3"
            role="group"
            aria-label="Profile stats"
          >
            <StatBlock label="Wins" value={winCount} />
            <button
              type="button"
              className="text-center group min-h-[44px]"
              onClick={onFollowersClick}
              aria-label={`${formatCount(followerCount)} followers`}
            >
              <p className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors tabular-nums">
                {formatCount(followerCount)}
              </p>
              <p className="text-xs text-sb-muted uppercase tracking-wider">Followers</p>
            </button>
            <button
              type="button"
              className="text-center group min-h-[44px]"
              onClick={onFollowingClick}
              aria-label={`${formatCount(followingCount)} following`}
            >
              <p className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors tabular-nums">
                {formatCount(followingCount)}
              </p>
              <p className="text-xs text-sb-muted uppercase tracking-wider">Following</p>
            </button>
            <StatBlock label="Pick Cards" value={pickCount} />
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-sb-muted mb-2">
            <span className="rounded-full bg-white/5 px-2.5 py-1 border border-white/10">
              {tierVisual.icon} {profile.tierName ?? "Rookie"}
              {profile.creatorLevel && profile.creatorLevel in CREATOR_LEVEL_LABELS
                ? ` · ${CREATOR_LEVEL_LABELS[profile.creatorLevel as keyof typeof CREATOR_LEVEL_LABELS]}`
                : null}
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-1 border border-white/10">
              Member since {formatMemberSince(profile.memberSince)}
            </span>
            {profile.favoriteTeam ? (
              <span className="rounded-full bg-white/5 px-2.5 py-1 border border-white/10">
                🏈 {profile.favoriteTeam}
              </span>
            ) : null}
          </div>

          {profile.playerId ? (
            <p className="text-xs text-purple-300/80 font-mono mb-1">{profile.playerId}</p>
          ) : null}

          {profile.bio ? (
            <p className="text-sm text-sb-muted max-w-lg whitespace-pre-wrap mx-auto sm:mx-0">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-sb-muted">{profile.headline}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3 text-xs text-sb-muted justify-center sm:justify-start">
            {profile.pickAccuracyPct != null ? (
              <span className="rounded-full bg-white/5 px-2.5 py-1">🎯 {profile.pickAccuracyPct}% accuracy</span>
            ) : null}
            {(profile.communityReputation ?? 0) > 0 ? (
              <span className="rounded-full bg-white/5 px-2.5 py-1">
                ⭐ {formatCount(profile.communityReputation!)} rep
              </span>
            ) : null}
          </div>

          {mutualConnections.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs text-sb-muted">Mutual connections:</span>
              {mutualConnections.slice(0, 4).map((user) => (
                <Link
                  key={user.email}
                  href={publicProfilePath(user.slug)}
                  className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10 transition-colors"
                  title={user.username}
                >
                  <span aria-hidden>{user.avatarEmoji}</span>
                  {user.username}
                </Link>
              ))}
              {mutualConnections.length > 4 ? (
                <span className="text-xs text-sb-muted">+{mutualConnections.length - 4} more</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center min-h-[44px]">
      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{formatCount(value)}</p>
      <p className="text-xs text-sb-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}
