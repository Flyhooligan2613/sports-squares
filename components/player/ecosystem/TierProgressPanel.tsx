"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlayerTierCard from "@/components/player/ecosystem/PlayerTierCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";

const ALL_TIERS = [
  "rookie",
  "contender",
  "all-star",
  "champion",
  "elite",
  "legend",
  "hall-of-fame",
  "immortal",
] as const;

export default function TierProgressPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading tier progress…</p>;
  }

  const currentIdx = ALL_TIERS.indexOf(data.dashboard.tier.slug);

  return (
    <div className="space-y-6">
      <PlayerTierCard showAvatarPicker />

      <LandingGlassCard className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Tier Ladder</h3>
        <div className="space-y-2">
          {ALL_TIERS.map((slug, idx) => {
            const visual = getTierVisual(slug);
            const unlocked = idx <= currentIdx;
            return (
              <div
                key={slug}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3",
                  unlocked ? "border-white/15 bg-white/[0.04]" : "border-white/5 opacity-50",
                  slug === data.dashboard.tier.slug ? "ring-1 ring-sb-purple/50" : "",
                ].join(" ")}
              >
                <span className="text-2xl">{visual.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-white capitalize">{slug.replace(/-/g, " ")}</p>
                  <p className="text-xs text-sb-muted">
                    {unlocked ? "Unlocked" : "Locked"} · Exclusive boxes, frames & VIP rewards
                  </p>
                </div>
                {slug === data.dashboard.tier.slug ? (
                  <span className="text-xs text-sb-purple-light font-semibold">Current</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </LandingGlassCard>
    </div>
  );
}
