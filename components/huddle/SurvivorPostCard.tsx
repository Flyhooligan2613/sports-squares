"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { CREATOR_LEVEL_LABELS, type HuddleSurvivorPost } from "@/lib/huddle/types";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { publicProfilePath } from "@/lib/player/slug";

interface SurvivorPostCardProps {
  post: HuddleSurvivorPost;
  onUpdate: () => void;
}

export default function SurvivorPostCard({ post, onUpdate }: SurvivorPostCardProps) {
  const tierVisual = getTierVisual(post.author.tierSlug);

  async function toggleLike() {
    await fetch(`/api/huddle/survivor-post/${post.id}/like`, {
      method: "POST",
      credentials: "include",
    });
    onUpdate();
  }

  return (
    <LandingGlassCard className="p-5 border border-amber-500/20">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">{post.author.avatarEmoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={publicProfilePath(post.author.slug)}
                className="font-semibold text-white hover:text-amber-300"
              >
                {post.author.username}
              </Link>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-300">
                Survivor X
              </span>
            </div>
            <p className="text-xs text-sb-muted">
              {tierVisual.icon} {post.author.tierName} · {post.weekLabel}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-sb-muted uppercase tracking-wider">
          {CREATOR_LEVEL_LABELS[post.author.creatorLevel]}
        </p>
      </div>

      <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-4 mb-4">
        <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Survival pick</p>
        <p className="text-xl font-bold text-white">{post.teamName}</p>
        <p className="text-sm text-amber-400/90 font-mono mt-1">{post.teamAbbr}</p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <span className="rounded-full bg-white/5 px-2 py-1 text-sb-muted">
            {post.weeksSurvived} weeks survived
          </span>
          {post.shieldAvailable ? (
            <span className="rounded-full bg-violet-500/15 px-2 py-1 text-violet-200">
              🛡️ Shield ready
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void toggleLike()}
          className={`text-sm font-medium transition-colors ${
            post.likedByViewer ? "text-amber-400" : "text-sb-muted hover:text-white"
          }`}
        >
          {post.likedByViewer ? "♥ Liked" : "♡ Like"} · {post.likeCount}
        </button>
        <Link href="/survivor/week" className="text-xs text-amber-400 hover:text-amber-300">
          Play Survivor →
        </Link>
      </div>
    </LandingGlassCard>
  );
}
