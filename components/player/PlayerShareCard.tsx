"use client";

import { useCallback, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import { publicProfilePath } from "@/lib/player/slug";
import { PLAYER_TERMS } from "@/lib/platform/language";

function winRate(stats: PublicPlayerProfile["stats"]): string {
  if (stats.boardsPlayed <= 0) return "—";
  return `${Math.round((stats.lifetimeWins / stats.boardsPlayed) * 100)}%`;
}

interface PlayerShareCardProps {
  profile: PublicPlayerProfile;
  className?: string;
}

export default function PlayerShareCard({ profile, className = "" }: PlayerShareCardProps) {
  const [copied, setCopied] = useState(false);
  const tierVisual = getTierVisual((profile.tierSlug ?? "rookie") as PlayerTierSlug);
  const seasonRank = profile.ranks[0] ? `#${profile.ranks[0].rank}` : "—";
  const unlockedAchievements = profile.achievements.filter((a) => a.unlocked);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${publicProfilePath(profile.slug)}`;
    const text = `${profile.displayName} · ${profile.tierName ?? "Rookie"} · ${winRate(profile.stats)} win rate`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.displayName} · ${PLAYER_TERMS.competitorCard}`,
          text,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelled */
    }
  }, [profile]);

  return (
    <section className={className} aria-label="Shareable player card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
          Player Card
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleShare()}
          aria-label="Share player card"
        >
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

      <LandingGlassCard
        id="player-share-card"
        className={`relative overflow-hidden p-6 sm:p-8 border ${tierVisual.frameClass} sb-card-lift`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sb-purple/25 via-transparent to-emerald-500/10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl border border-white/10 bg-white/5 shrink-0 ${tierVisual.frameClass}`}
              aria-hidden
            >
              {profile.avatarEmoji ?? "🎲"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-sb-glow/80 mb-1">
                SquareBoards Competitor
              </p>
              <p className="text-lg font-bold text-white truncate">
                @{profile.username ?? profile.slug.split("-")[0]}
              </p>
              <p className="text-sm text-white/90 truncate">{profile.displayName}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full border border-sb-purple/30 bg-sb-purple/15 text-sb-glow">
                  {tierVisual.icon} {profile.tierName ?? "Rookie"}
                </span>
                {profile.isVerified ? (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-sky-400/30 text-sky-300">
                    ✓ Verified
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <ShareStat label="Win %" value={winRate(profile.stats)} />
            <ShareStat label="Season" value={seasonRank} />
            <ShareStat label="Wins" value={String(profile.stats.lifetimeWins)} />
          </div>

          {profile.favoriteTeam ? (
            <p className="text-xs text-sb-muted mb-4">
              Favorite: <span className="text-white">{profile.favoriteTeam}</span>
            </p>
          ) : null}

          {unlockedAchievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.slice(0, 5).map((a) => (
                <span
                  key={a.id}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white"
                  title={a.description}
                >
                  {a.emoji} {a.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </LandingGlassCard>
    </section>
  );
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-sb-muted">{label}</p>
      <p className="text-lg font-bold text-white tabular-nums mt-1">{value}</p>
    </div>
  );
}
