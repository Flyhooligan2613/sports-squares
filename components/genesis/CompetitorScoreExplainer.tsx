"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { GENESIS_STARTING_COMPETITOR_SCORE } from "@/lib/platform/engines/genesis";
import type { CompetitorScore } from "@/lib/competitorCard/types";

interface CompetitorScoreExplainerProps {
  score: CompetitorScore;
}

export default function CompetitorScoreExplainer({ score }: CompetitorScoreExplainerProps) {
  if (!score.genesisStartingBonus) return null;

  return (
    <LandingGlassCard className="p-4 sm:p-5 mt-4 border border-sb-glow/20 bg-sb-glow/5">
      <p className="text-[10px] uppercase tracking-wider text-sb-glow mb-1">Rookie Starting Score</p>
      <p className="text-sm text-white font-medium">
        Why {GENESIS_STARTING_COMPETITOR_SCORE}? Every official competitor begins with merit on the
        board — not wallet balance. Your score grows through contests, wins, achievements, and
        community reputation.
      </p>
      <p className="text-xs text-sb-muted mt-2">
        Current merit breakdown: {score.total - (score.genesisStartingBonus ?? 0)} earned +{" "}
        {score.genesisStartingBonus} Rookie Season floor
      </p>
    </LandingGlassCard>
  );
}
