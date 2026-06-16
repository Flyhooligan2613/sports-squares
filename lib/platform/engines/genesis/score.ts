import type { CompetitorScore } from "@/lib/competitorCard/types";
import { GENESIS_STARTING_COMPETITOR_SCORE } from "@/lib/platform/engines/genesis/config";

/** Apply Rookie Season starting score floor for genesis accounts with no contest history. */
export function applyGenesisStartingScore(
  score: CompetitorScore,
  options: { genesisActive: boolean; boardsPlayed: number }
): CompetitorScore {
  if (!options.genesisActive || options.boardsPlayed > 0) return score;
  if (score.total >= GENESIS_STARTING_COMPETITOR_SCORE) return score;

  return {
    ...score,
    total: GENESIS_STARTING_COMPETITOR_SCORE,
    genesisStartingBonus: GENESIS_STARTING_COMPETITOR_SCORE - score.total,
  };
}
