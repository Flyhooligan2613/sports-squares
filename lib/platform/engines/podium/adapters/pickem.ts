import { normalizeEmail } from "@/lib/player/statsCore";
import { getSundayStandings } from "@/lib/pickem/db/stats";
import { listPickemStatsForLeaderboard } from "@/lib/pickem/db/stats";
import {
  listPlayerWeekResultsForLeague,
  upsertPlayerWeekResult,
} from "@/lib/pickem/db/playerWeekResults";
import { savePickemWeekHistory } from "@/lib/pickem/db/history";
import {
  processLeaguePodiumPayouts,
  recordPickemPodiumStats,
} from "@/lib/pickem/payouts";
import type { PickemLeague } from "@/lib/pickem/db/leagues";
import type { PickemContest, PickemSport } from "@/lib/pickem/types";
import type {
  PodiumAwardResult,
  PodiumContestAdapter,
  PodiumContestResult,
  PodiumResolution,
  PodiumStandingsEntry,
} from "@/lib/platform/engines/podium/types";
import { rankStandings } from "@/lib/platform/engines/podium/resolvePodium";

interface PickemWeeklyContext {
  contest: PickemContest;
  league: PickemLeague;
  splitEqually: boolean;
  tiebreakerUsed: boolean;
}

interface PickemSeasonContext {
  sport: PickemSport;
  seasonYear: number;
}

function pickemWeeklyContext(
  result: PodiumContestResult
): PickemWeeklyContext {
  const ctx = result.context as Partial<PickemWeeklyContext> | undefined;
  if (!ctx?.contest || !ctx?.league) {
    throw new Error("Pick'em weekly adapter requires contest and league in context.");
  }
  return {
    contest: ctx.contest,
    league: ctx.league,
    splitEqually: ctx.splitEqually ?? false,
    tiebreakerUsed: ctx.tiebreakerUsed ?? false,
  };
}

async function persistPickemWeekPodiumResults(input: {
  contestResult: PodiumContestResult;
  resolution: PodiumResolution;
  award: PodiumAwardResult;
}): Promise<void> {
  const { contest, league, splitEqually, tiebreakerUsed } = pickemWeeklyContext(
    input.contestResult
  );
  const existing = await listPlayerWeekResultsForLeague(input.contestResult.leagueId!);
  const payoutByEmail = new Map(
    input.award.payouts.map((p) => [p.email.toLowerCase(), p])
  );

  for (const placement of input.resolution.placements) {
    const email = normalizeEmail(placement.email);
    const row =
      existing.find((r) => r.email === email) ??
      ({
        contestId: input.contestResult.contestId,
        leagueId: input.contestResult.leagueId!,
        email,
        sundayWins: 0,
        sundayLosses: 0,
        sundayRecord: "0-0",
        status: "eliminated" as const,
        finishPlace: placement.rank,
        payoutCents: 0,
      } as const);

    const payout = payoutByEmail.get(email.toLowerCase());
    const isFirst = placement.placement === 1;
    const status = isFirst
      ? splitEqually
        ? ("prize_split" as const)
        : ("winner" as const)
      : placement.placement === 2
        ? ("runner_up" as const)
        : ("third_place" as const);

    await upsertPlayerWeekResult({
      ...row,
      status,
      finishPlace: placement.placement,
      payoutCents: payout?.amountCents ?? 0,
    });

    await recordPickemPodiumStats({
      email,
      sport: contest.sport,
      seasonYear: contest.seasonYear,
      earningsCents: payout?.amountCents ?? 0,
      tiebreakerWin: tiebreakerUsed && isFirst && !splitEqually,
      weeklyRecord: row.sundayRecord,
      placement: placement.placement,
    });

    await savePickemWeekHistory({
      email,
      contestId: input.contestResult.contestId,
      leagueId: input.contestResult.leagueId!,
      sport: contest.sport,
      seasonYear: contest.seasonYear,
      weekLabel: contest.label,
      entryTierCents: league.entryTierCents,
      poolNumber: league.leagueNumber,
      weeklyRecord: row.sundayRecord,
      finishPlace: placement.placement,
      status,
      earningsCents: payout?.amountCents ?? 0,
      tiebreakerUsed: tiebreakerUsed && isFirst,
    });
  }

  for (const near of input.resolution.nearPerfect) {
    const email = normalizeEmail(near.email);
    const row = existing.find((r) => r.email === email);
    if (!row) continue;

    await savePickemWeekHistory({
      email,
      contestId: input.contestResult.contestId,
      leagueId: input.contestResult.leagueId!,
      sport: contest.sport,
      seasonYear: contest.seasonYear,
      weekLabel: contest.label,
      entryTierCents: league.entryTierCents,
      poolNumber: league.leagueNumber,
      weeklyRecord: row.sundayRecord,
      finishPlace: near.rank,
      status: "near_perfect",
      earningsCents: 0,
      tiebreakerUsed: false,
    });
  }
}

/** Pick'em weekly league adapter — all sports share this adapter with sport param. */
export const pickemWeeklyAdapter: PodiumContestAdapter = {
  kind: "pickem_weekly",

  async resolveStandings(result: PodiumContestResult): Promise<PodiumStandingsEntry[]> {
    const sunday = await getSundayStandings({
      contestId: result.contestId,
      leagueId: result.leagueId!,
    });
    return rankStandings(
      sunday.map((r) => ({ email: r.email, score: r.wins })),
      (r) => r.score
    );
  },

  async getPrizePool(result: PodiumContestResult): Promise<number> {
    const { league } = pickemWeeklyContext(result);
    return league.prizePoolCents;
  },

  async onAwarded(input): Promise<void> {
    await persistPickemWeekPodiumResults({
      contestResult: input.contestResult,
      resolution: input.resolution,
      award: input.award,
    });
    await processLeaguePodiumPayouts({
      contestId: input.contestResult.contestId,
      leagueId: input.contestResult.leagueId!,
      payouts: input.award.payouts,
    });
  },
};

/** Pick'em season championship adapter — prestige rewards, no league cash pool. */
export const pickemSeasonAdapter: PodiumContestAdapter = {
  kind: "pickem_season",

  async resolveStandings(result: PodiumContestResult): Promise<PodiumStandingsEntry[]> {
    const ctx = result.context as Partial<PickemSeasonContext> | undefined;
    const sport = (ctx?.sport ?? result.sport) as PickemSport;
    const seasonYear = ctx?.seasonYear ?? result.seasonYear;
    if (!sport || seasonYear == null) {
      throw new Error("Pick'em season adapter requires sport and seasonYear.");
    }

    const stats = await listPickemStatsForLeaderboard({
      sport,
      seasonYear,
      limit: 100,
    });

    return rankStandings(
      stats.map((s) => ({
        email: s.email,
        score: s.seasonWins * 1000 + s.pickAccuracyPct,
      }))
    );
  },

  async getPrizePool(): Promise<number> {
    return 0;
  },
};
