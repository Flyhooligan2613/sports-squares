"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlayerTierCard from "@/components/player/ecosystem/PlayerTierCard";
import RewardsProgressBar from "@/components/player/ecosystem/RewardsProgressBar";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { getTierDisplayName } from "@/lib/platform/language/rewardsLanguage";
import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";

const ALL_TIERS: PlayerTierSlug[] = [
  "rookie",
  "contender",
  "all-star",
  "champion",
  "elite",
  "legend",
  "hall-of-fame",
  "immortal",
];

export default function TierProgressPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading tier progress…</p>;
  }

  const currentIdx = ALL_TIERS.indexOf(data.dashboard.tier.slug);
  const lifetimeCredits = data.dashboard.account.lifetimeTierCredits;

  return (
    <div className="space-y-6">
      <PlayerTierCard showAvatarPicker />

      <LandingGlassCard className="p-5 sb-card-lift">
        <h3 className="text-lg font-semibold text-white mb-2">Player Levels</h3>
        <p className="text-xs text-sb-muted mb-4">
          Bronze → Silver → Gold → Platinum → Diamond → Elite — earn lifetime credits through competition
        </p>
        <div className="space-y-3">
          {ALL_TIERS.map((slug, idx) => {
            const visual = getTierVisual(slug);
            const displayName = getTierDisplayName(slug);
            const isCurrent = slug === data.dashboard.tier.slug;
            const isUnlocked = idx <= currentIdx;
            const tierDef = idx === currentIdx ? data.dashboard.tier : null;
            const nextDef = data.dashboard.nextTier;
            const minCredits =
              idx === currentIdx
                ? data.dashboard.tier.minLifetimeCredits
                : idx < currentIdx
                  ? 0
                  : nextDef && slug === nextDef.slug
                    ? nextDef.minLifetimeCredits
                    : undefined;

            return (
              <div
                key={slug}
                className={[
                  "rounded-xl border px-4 py-4 sb-card-lift",
                  isUnlocked ? "border-white/15 bg-white/[0.04]" : "border-white/5 opacity-55",
                  isCurrent ? "ring-1 ring-sb-purple/50" : "",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {visual.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{displayName}</p>
                      {isCurrent ? (
                        <span className="text-[10px] uppercase tracking-wider text-sb-purple-light font-semibold px-2 py-0.5 rounded-full border border-sb-purple/30">
                          Current
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400/90">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider text-sb-muted">Locked</span>
                      )}
                    </div>
                    <p className="text-xs text-sb-muted mt-1 capitalize">
                      {slug.replace(/-/g, " ")} · Profile frames, drops & recognition
                    </p>
                    {tierDef?.benefits?.length && isCurrent ? (
                      <ul className="flex flex-wrap gap-1.5 mt-2" role="list">
                        {tierDef.benefits.slice(0, 3).map((b) => (
                          <li
                            key={b}
                            className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/80"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {isCurrent && data.dashboard.nextTier ? (
                      <RewardsProgressBar
                        label={`Progress to ${getTierDisplayName(data.dashboard.nextTier.slug)}`}
                        current={lifetimeCredits}
                        target={lifetimeCredits + data.dashboard.creditsToNextTier}
                        pct={data.dashboard.tierProgressPct}
                        accent={visual.color}
                        className="mt-3"
                      />
                    ) : null}
                    {!isUnlocked && minCredits != null ? (
                      <p className="text-[10px] text-sb-muted mt-2">
                        Requires {minCredits.toLocaleString()} lifetime credits
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </LandingGlassCard>
    </div>
  );
}
