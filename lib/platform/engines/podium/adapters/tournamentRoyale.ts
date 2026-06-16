import type {
  PodiumContestAdapter,
  PodiumContestResult,
  PodiumStandingsEntry,
} from "@/lib/platform/engines/podium/types";
import { rankStandings } from "@/lib/platform/engines/podium/resolvePodium";

export interface TournamentRoyalePodiumContext {
  tournamentLabel?: string;
  standings: Array<{ email: string; score: number }>;
  prizePoolCents: number;
}

/**
 * Tournament Royale adapter — scaffold wired to orchestrator.
 * Supply standings + prize pool via context when contest completes.
 */
export const tournamentRoyaleAdapter: PodiumContestAdapter = {
  kind: "tournament_royale",

  async resolveStandings(result: PodiumContestResult): Promise<PodiumStandingsEntry[]> {
    const ctx = result.context as Partial<TournamentRoyalePodiumContext> | undefined;
    if (!ctx?.standings?.length) {
      throw new Error("Tournament Royale adapter requires standings in context.");
    }
    return rankStandings(ctx.standings);
  },

  async getPrizePool(result: PodiumContestResult): Promise<number> {
    const ctx = result.context as Partial<TournamentRoyalePodiumContext> | undefined;
    return ctx?.prizePoolCents ?? 0;
  },
};
