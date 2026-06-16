import type { CompetitorScore } from "@/lib/competitorCard/types";

/** Apply SquarePass merit score boost (capped at platform max). */
export function applySquarePassScoreBoost(
  score: CompetitorScore,
  bonus: number
): CompetitorScore {
  if (bonus <= 0) return score;
  return {
    ...score,
    total: Math.min(score.total + bonus, 10_000),
  };
}
