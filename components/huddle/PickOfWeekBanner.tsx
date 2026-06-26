"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { HuddlePickPost } from "@/lib/huddle/types";
import { publicProfilePath } from "@/lib/player/slug";

export default function PickOfWeekBanner({
  post,
  onUpdate,
}: {
  post: HuddlePickPost;
  onUpdate: () => void;
}) {
  async function copyPicks() {
    await fetch(`/api/huddle/posts/${post.id}/copy`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryTierCents: 1000 }),
    });
    onUpdate();
  }

  return (
    <LandingGlassCard className="p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-600/10">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">⭐ Pick of the Week</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{post.author.avatarEmoji}</span>
          <div>
            <Link href={publicProfilePath(post.author.slug)} className="text-xl font-bold text-white hover:text-amber-200">
              {post.author.username}
            </Link>
            <p className="text-sm text-sb-muted">
              {post.author.tierName} · {post.weeklyRecord} · {post.author.followerCount} followers · {post.weeklyStreak} streak
            </p>
            {post.bioSnapshot ? <p className="text-xs text-sb-muted mt-1 max-w-md">{post.bioSnapshot}</p> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="player-btn-glow" onClick={() => void copyPicks()}>
            Copy Picks
          </Button>
          <Link href={publicProfilePath(post.author.slug)}>
            <Button variant="secondary">View Profile</Button>
          </Link>
        </div>
      </div>
    </LandingGlassCard>
  );
}
