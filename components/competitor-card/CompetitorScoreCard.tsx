"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CompetitorScore } from "@/lib/competitorCard/types";
import { AnimatedStatValue, formatPercentile, SectionCard } from "./shared";

interface CompetitorScoreCardProps {
  score: CompetitorScore;
}

export default function CompetitorScoreCard({ score }: CompetitorScoreCardProps) {
  return (
    <SectionCard id="competitor-score" title={COMPETITOR_CARD_COPY.scoreLabel}>
      <LandingGlassCard glow className="p-6 sm:p-8 border border-sb-glow/20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">
              {COMPETITOR_CARD_COPY.rankLabel}
            </p>
            <p className="text-lg sm:text-xl font-bold text-sb-glow">{score.rankTitle}</p>
          </div>
          <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
            <AnimatedStatValue value={score.total} className="text-white" />
          </p>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ["world", score.percentiles.world],
              ["state", score.percentiles.state],
              ["city", score.percentiles.city],
              ["friends", score.percentiles.friends],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-[10px] uppercase tracking-wider text-sb-muted">
                {COMPETITOR_CARD_COPY.percentiles[key]}
              </dt>
              <dd className="text-sm font-semibold text-white mt-1">{formatPercentile(value)}</dd>
            </div>
          ))}
        </dl>
      </LandingGlassCard>
    </SectionCard>
  );
}
