"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlayerAvatar from "@/components/player/PlayerAvatar";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import AvatarPicker from "@/components/player/ecosystem/AvatarPicker";
import RewardsProgressBar from "@/components/player/ecosystem/RewardsProgressBar";
import type { TierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import { getTierDisplayName } from "@/lib/platform/language/rewardsLanguage";

interface PlayerCardApiResponse {
  publicLabel?: string;
  profileBio?: string | null;
  account: {
    username: string | null;
    displayName: string;
    playerId: string;
    memberSince: string;
    availableTierCredits: number;
    tierLevel: number;
    lifetimeTierCredits?: number;
  };
  tier: { displayName: string; benefits: string[]; slug?: PlayerTierSlug; minLifetimeCredits?: number };
  nextTier: { displayName: string; slug?: PlayerTierSlug; minLifetimeCredits?: number } | null;
  creditsToNextTier: number;
  tierProgressPct: number;
  avatar?: string;
  tierVisual?: TierVisual;
  computedTierLevel?: number;
  xpToNext?: number;
  ranks?: { referral: number | null; global: number | null; state: number | null };
  legacy?: {
    lifetimeWinnings: number;
    lifetimeWins: number;
    currentStreak: number;
    longestStreak: number;
    memberSince: string;
    achievements: { id: string; title: string; emoji: string }[];
    loginStreakDays?: number;
    mysteryBoxesOpened?: number;
    lifetimeGameplayCents?: number;
    lifetimePurchasesCents?: number;
    lifetimeRewardsEarned?: number;
  } | null;
}

export default function PlayerTierCard({ showAvatarPicker = false }: { showAvatarPicker?: boolean }) {
  const [data, setData] = useState<PlayerCardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/ecosystem/player-card", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(json as PlayerCardApiResponse))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <LandingGlassCard className="p-8 text-center text-sb-muted animate-pulse min-h-[280px]">
        Loading Player Card…
      </LandingGlassCard>
    );
  }

  if (!data) return null;

  const visual = data.tierVisual;
  const level = data.computedTierLevel ?? data.account.tierLevel;
  const name = data.publicLabel ?? data.account.username ?? data.account.displayName;
  const legacy = data.legacy;
  const tierSlug = (data.tier.slug ?? "rookie") as PlayerTierSlug;
  const tierDisplay = getTierDisplayName(tierSlug);
  const nextDisplay = data.nextTier?.slug
    ? getTierDisplayName(data.nextTier.slug as PlayerTierSlug)
    : data.nextTier?.displayName ?? null;

  return (
    <LandingGlassCard
      className="relative overflow-hidden p-0 border-0 sb-card-lift"
      style={
        visual
          ? { boxShadow: `0 0 40px ${visual.color}33`, border: `1px solid ${visual.color}55` }
          : undefined
      }
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${visual?.gradient ?? "from-sb-purple/20 to-transparent"} pointer-events-none`}
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4 mb-6">
          <div
            className="rounded-2xl p-1"
            style={{ boxShadow: visual ? `0 0 24px ${visual.color}44` : undefined }}
          >
            <PlayerAvatar emoji={data.avatar} size="lg" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs uppercase tracking-[0.2em] text-sb-muted mb-1">
              <span aria-hidden>{visual?.icon}</span> {tierDisplay} Tier
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              {name}
            </h2>
            <p className="text-sm text-sb-muted mt-1">
              Level {level} · {data.account.playerId}
            </p>
            {data.nextTier ? (
              <p className="text-xs text-sb-muted mt-1">
                Requirement: {data.creditsToNextTier.toLocaleString()} credits to reach {nextDisplay}
              </p>
            ) : (
              <p className="text-xs text-emerald-300/90 mt-1">Maximum tier — legacy status achieved</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums" style={{ color: visual?.color }}>
              {data.account.availableTierCredits.toLocaleString()}
            </p>
            <p className="text-xs text-sb-muted">Tier Credits</p>
          </div>
        </div>

        <RewardsProgressBar
          label={nextDisplay ? `Progress to ${nextDisplay}` : "Tier progress"}
          current={data.account.lifetimeTierCredits ?? 0}
          target={
            (data.account.lifetimeTierCredits ?? 0) + Math.max(data.creditsToNextTier, 1)
          }
          pct={data.tierProgressPct}
          accent={visual?.color}
          className="mb-6"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <MiniStat label={PLATFORM_TERMS.lifetimeContestWinnings} value={`$${(legacy?.lifetimeWinnings ?? 0).toFixed(0)}`} />
          <MiniStat label="Career Wins" value={String(legacy?.lifetimeWins ?? 0)} />
          <MiniStat label="Login Streak" value={String(legacy?.loginStreakDays ?? 0)} />
          <MiniStat label="Win Streak" value={String(legacy?.currentStreak ?? 0)} />
          <MiniStat
            label="Referral Rank"
            value={data.ranks?.referral != null ? `#${data.ranks.referral}` : "—"}
          />
          <MiniStat label="Global Rank" value={data.ranks?.global != null ? `#${data.ranks.global}` : "—"} />
          <MiniStat label="State Rank" value={data.ranks?.state != null ? `#${data.ranks.state}` : "—"} />
          <MiniStat
            label="Member Since"
            value={new Date(legacy?.memberSince ?? data.account.memberSince).getFullYear().toString()}
          />
        </div>

        {data.tier.benefits.length ? (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Tier Benefits</p>
            <ul className="flex flex-wrap gap-2" role="list">
              {data.tier.benefits.map((b) => (
                <li
                  key={b}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white/90"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {legacy?.achievements?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Recent Achievements</p>
            <div className="flex flex-wrap gap-2">
              {legacy.achievements.slice(0, 8).map((a) => (
                <span
                  key={a.id}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white rewards-achievement-unlock"
                >
                  <span aria-hidden>{a.emoji}</span> {a.title}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {showAvatarPicker ? (
          <div className="mt-6 pt-6 border-t border-white/10">
            <AvatarPicker
              current={data.avatar}
              onChanged={(emoji) => setData((prev) => (prev ? { ...prev, avatar: emoji } : prev))}
            />
          </div>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 min-h-[56px]">
      <p className="text-[9px] uppercase tracking-wider text-sb-muted leading-tight">{label}</p>
      <p className="text-sm font-bold text-white mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}
