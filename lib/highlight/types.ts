import type { ScoringPeriod } from "@/lib/types";

export interface PoolHighlightSquare {
  squareNumber: number;
  rewardCredits: number;
  activatedAt?: string | null;
  activatedPeriod?: ScoringPeriod | null;
}
