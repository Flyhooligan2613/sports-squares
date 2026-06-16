import type {
  PodiumContestAdapter,
  PodiumContestResult,
  PodiumStandingsEntry,
} from "@/lib/platform/engines/podium/types";
import { rankStandings } from "@/lib/platform/engines/podium/resolvePodium";

export interface SurvivorPodiumContext {
  standings: Array<{ email: string; score: number }>;
  prizePoolCents: number;
  leagueId: string;
}

/**
 * Survivor adapter — scaffold for league championship podium.
 * Wire when survivor final standings resolution is ready.
 */
export const survivorAdapter: PodiumContestAdapter = {
  kind: "survivor",

  async resolveStandings(result: PodiumContestResult): Promise<PodiumStandingsEntry[]> {
    const ctx = result.context as Partial<SurvivorPodiumContext> | undefined;
    if (!ctx?.standings?.length) {
      throw new Error("Survivor adapter requires standings in context.");
    }
    return rankStandings(ctx.standings);
  },

  async getPrizePool(result: PodiumContestResult): Promise<number> {
    const ctx = result.context as Partial<SurvivorPodiumContext> | undefined;
    return ctx?.prizePoolCents ?? 0;
  },
};
