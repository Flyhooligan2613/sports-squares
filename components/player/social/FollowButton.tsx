"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import MicroCelebration from "@/components/alive/MicroCelebration";

interface FollowButtonProps {
  slug: string;
  initialFollowing: boolean;
  displayName?: string;
  onChange?: (following: boolean) => void;
}

export default function FollowButton({
  slug,
  initialFollowing,
  displayName,
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(0);

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
      if (next) setCelebrate((c) => c + 1);
    }
  }

  const label = following ? "Following" : "Follow";
  const ariaLabel = displayName
    ? `${label} ${displayName}`
    : `${label} player`;

  return (
    <div className="relative inline-flex flex-col items-center">
      <Button
        variant={following ? "secondary" : "primary"}
        size="sm"
        disabled={loading}
        className={following ? "sb-card-lift" : "player-btn-glow sb-card-lift"}
        onClick={() => void toggle()}
        aria-pressed={following}
        aria-label={ariaLabel}
      >
        {loading ? "…" : label}
      </Button>
      <MicroCelebration trigger={celebrate} label="Following" tier="medium" />
    </div>
  );
}
