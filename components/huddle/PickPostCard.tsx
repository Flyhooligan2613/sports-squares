"use client";

import Link from "next/link";
import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { CREATOR_LEVEL_LABELS, type HuddlePickPost } from "@/lib/huddle/types";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";

interface PickPostCardProps {
  post: HuddlePickPost;
  onUpdate: () => void;
}

export default function PickPostCard({ post, onUpdate }: PickPostCardProps) {
  const tierVisual = getTierVisual(post.author.tierSlug);
  const [following, setFollowing] = useState(false);

  async function toggleLike() {
    await fetch(`/api/huddle/posts/${post.id}/like`, {
      method: "POST",
      credentials: "include",
    });
    onUpdate();
  }

  async function copyPicks() {
    const res = await fetch(`/api/huddle/posts/${post.id}/copy`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryTierCents: 1000 }),
    });
    const json = (await res.json()) as { error?: string; copied?: number; skippedMonday?: boolean };
    if (!res.ok) {
      alert(json.error ?? "Could not copy picks.");
      return;
    }
    alert(
      `Copied ${json.copied ?? 0} Sunday picks. Choose your own Monday Night pick to complete your card.`
    );
    onUpdate();
  }

  async function toggleFollow() {
    const res = await fetch("/api/huddle/follow", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: post.author.slug,
        action: following ? "unfollow" : "follow",
      }),
    });
    if (res.ok) setFollowing(!following);
    onUpdate();
  }

  return (
    <LandingGlassCard className="p-5 border border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">{post.author.avatarEmoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/player/${post.author.slug}`} className="font-semibold text-white hover:text-purple-300">
                {post.author.username}
              </Link>
              {post.author.isVerified ? (
                <span className="text-sky-400 text-xs" title="Verified">✓</span>
              ) : null}
              <span className="text-[10px] uppercase tracking-wider text-sb-muted">{post.author.playerId}</span>
            </div>
            <p className="text-xs text-sb-muted">
              {tierVisual.icon} {post.author.tierName} · {post.author.followerCount.toLocaleString()} followers
            </p>
            {post.bioSnapshot ? (
              <p className="text-xs text-sb-muted mt-1 line-clamp-2">{post.bioSnapshot}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right text-xs text-sb-muted shrink-0">
          <p className="text-white font-semibold">{post.weekLabel}</p>
          <p>Record {post.weeklyRecord ?? "—"}</p>
          <p>{post.weeklyStreak} streak</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {post.picks.map((pick) => (
          <div
            key={pick.gameId}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"
          >
            <p className="text-sb-muted mb-1">Sunday</p>
            <p className="text-white font-medium">
              {pick.pickedSide === "away" ? "✓ " : ""}
              {pick.awayAbbr ?? pick.awayTeam}
              {" @ "}
              {pick.pickedSide === "home" ? "✓ " : ""}
              {pick.homeAbbr ?? pick.homeTeam}
            </p>
          </div>
        ))}
        <div className="rounded-lg border border-dashed border-purple-500/30 bg-purple-500/5 px-3 py-2 text-xs flex items-center">
          <p className="text-purple-200">Monday Night — pick your own 🔒</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" className="text-xs" onClick={() => void toggleLike()}>
          👍 {post.likeCount}{post.likedByViewer ? " Liked" : " Like"}
        </Button>
        <Button variant="secondary" className="text-xs" onClick={() => void copyPicks()}>
          📋 Copy Sunday Picks ({post.copyCount})
        </Button>
        <Button variant="secondary" className="text-xs" onClick={() => void toggleFollow()}>
          {following ? "Following" : "+ Follow"}
        </Button>
        <span className="text-[10px] text-sb-muted ml-auto">
          {CREATOR_LEVEL_LABELS[post.author.creatorLevel]} · Rep {post.author.communityReputation.toLocaleString()}
        </span>
      </div>
    </LandingGlassCard>
  );
}
