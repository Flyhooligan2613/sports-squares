"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { TierProgress } from "@/lib/competitorCard/types";
import { getTierVisual } from "@/lib/platform/ecosystem/tierVisuals";
import { SectionCard } from "./shared";

interface TierProgressCardProps {
  tier: TierProgress;
}

export default function TierProgressCard({ tier }: TierProgressCardProps) {
  const visual = getTierVisual(tier.slug);

  return (
    <SectionCard id="tier-progress" title={COMPETITOR_CARD_COPY.tierProgress}>
      <LandingGlassCard className={`p-6 sm:p-8 bg-gradient-to-br ${visual.gradient}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-2xl font-bold text-white">
              {visual.icon} {tier.name}
            </p>
            <p className="text-sm text-sb-muted">Level {tier.level}</p>
          </div>
          <p className="text-sm text-sb-muted">
            {tier.nextTierName
              ? `${tier.creditsToNext.toLocaleString()} credits to ${tier.nextTierName}`
              : "Max tier reached"}
          </p>
        </div>
        <div
          className="h-2.5 rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={tier.progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tier progress: ${tier.progressPct}%`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sb-purple to-emerald-400 transition-all duration-300 ease-out will-change-transform"
            style={{ width: `${tier.progressPct}%` }}
          />
        </div>
        <p className="text-xs text-sb-muted mt-2">
          {tier.lifetimeCredits.toLocaleString()} lifetime tier credits
        </p>
      </LandingGlassCard>
    </SectionCard>
  );
}
