"use client";

import { useCallback, useState } from "react";
import { Copy, Share2, Swords, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CompetitorCardData } from "@/lib/competitorCard/types";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { PLAYER_TERMS } from "@/lib/platform/language";

interface CompetitorHeaderProps {
  data: CompetitorCardData;
  onFollowChange?: (following: boolean) => void;
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
      onClick={() => void toggle()}
      aria-pressed={following}
    >
      {following ? COMPETITOR_CARD_COPY.following : COMPETITOR_CARD_COPY.follow}
    </Button>
  );
}

export default function CompetitorHeader({ data, onFollowChange }: CompetitorHeaderProps) {
  const [copied, setCopied] = useState(false);
  const visual = getTierVisual(data.identity.tierSlug);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${data.sharePath}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${data.identity.displayName} · ${PLAYER_TERMS.competitorCard}`,
          text: data.identity.headline,
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
  }, [data]);

  return (
    <header className="cc-hero relative overflow-hidden rounded-2xl border border-sb-purple/25 bg-gradient-to-br from-sb-purple/20 via-sb-surface/80 to-emerald-500/10 p-6 sm:p-8 admin-stat-enter">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,97,255,0.15),transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row gap-6 items-start">
        <div
          className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border border-white/10 bg-white/5 ${visual.frameClass}`}
          aria-hidden
        >
          {data.identity.avatarEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sb-glow/80 mb-2">
            {COMPETITOR_CARD_COPY.title}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
            {data.identity.displayName}
          </h1>
          {data.identity.playerId ? (
            <p className="text-sm text-sb-muted mt-1">{data.identity.playerId}</p>
          ) : null}
          <p className="text-sm text-sb-secondary mt-2 max-w-prose">{data.identity.headline}</p>
          {data.identity.bio ? (
            <p className="text-sm text-sb-muted mt-2">{data.identity.bio}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs px-2.5 py-1 rounded-full border border-sb-purple/30 bg-sb-purple/15 text-sb-glow">
              {visual.icon} {data.identity.tierName} · Lv {data.identity.tierLevel}
            </span>
            {data.identity.isVerified ? (
              <span className="text-xs px-2.5 py-1 rounded-full border border-sky-400/30 text-sky-300">
                ✓ Verified
              </span>
            ) : null}
            {data.identity.favoriteTeam ? (
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-sb-muted">
                {data.identity.favoriteTeam}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          {data.quickActions.canFollow ? (
            <FollowButton
              slug={data.slug}
              initialFollowing={data.community.viewerIsFollowing}
              onChange={onFollowChange}
            />
          ) : null}
          {data.quickActions.canShare ? (
            <Button variant="ghost" size="sm" onClick={() => void handleShare()} aria-label={COMPETITOR_CARD_COPY.shareProfile}>
              {copied ? <Copy className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : COMPETITOR_CARD_COPY.shareProfile}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            disabled
            aria-label={`${COMPETITOR_CARD_COPY.challenge} — ${COMPETITOR_CARD_COPY.comingSoon}`}
            title={COMPETITOR_CARD_COPY.comingSoon}
          >
            <Swords className="w-4 h-4 mr-2" />
            {COMPETITOR_CARD_COPY.challenge}
          </Button>
          {data.quickActions.canReport ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              aria-label={`${COMPETITOR_CARD_COPY.report} — ${COMPETITOR_CARD_COPY.comingSoon}`}
              title={COMPETITOR_CARD_COPY.comingSoon}
            >
              <Flag className="w-4 h-4 mr-2" />
              {COMPETITOR_CARD_COPY.report}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
