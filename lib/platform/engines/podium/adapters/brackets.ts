import type {
  PodiumContestAdapter,
  PodiumContestResult,
  PodiumStandingsEntry,
} from "@/lib/platform/engines/podium/types";
import { rankStandings } from "@/lib/platform/engines/podium/resolvePodium";

export interface BracketPodiumContext {
  standings: Array<{ email: string; score: number }>;
  prizePoolCents: number;
  bracketId: string;
}

/**
 * Brackets adapter — scaffold for bracket championship podium.
 * Wire when bracket final standings resolution is ready.
 */
export const bracketsAdapter: PodiumContestAdapter = {
  kind: "bracket",

  async resolveStandings(result: PodiumContestResult): Promise<PodiumStandingsEntry[]> {
    const ctx = result.context as Partial<BracketPodiumContext> | undefined;
    if (!ctx?.standings?.length) {
      throw new Error("Brackets adapter requires standings in context.");
    }
    return rankStandings(ctx.standings);
  },

  async getPrizePool(result: PodiumContestResult): Promise<number> {
    const ctx = result.context as Partial<BracketPodiumContext> | undefined;
    return ctx?.prizePoolCents ?? 0;
  },
};
