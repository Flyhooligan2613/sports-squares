import { normalizeEmail } from "@/lib/player/statsCore";
import { getSundayStandings } from "@/lib/pickem/db/stats";
import { listPickemStatsForLeaderboard } from "@/lib/pickem/db/stats";
import {
  awardPodiumWithDefaults,
  getPodiumConfig,
  rankStandings,
  resolvePodium,
} from "@/lib/platform/podium";
import type { PodiumAwardResult, PodiumResolution } from "@/lib/platform/podium/types";
import {
  processLeaguePodiumPayouts,
  recordPickemPodiumStats,
} from "@/lib/pickem/payouts";
import {
  listPlayerWeekResultsForLeague,
  upsertPlayerWeekResult,
} from "@/lib/pickem/db/playerWeekResults";
import { savePickemWeekHistory } from "@/lib/pickem/db/history";
import type { PickemContest, PickemLeague, PickemSport } from "@/lib/pickem/types";

export interface PickemLeaguePodiumResult {
  resolution: PodiumResolution;
  award: PodiumAwardResult;
  podiumEnabled: boolean;
}

function standingsFromSunday(
  rows: Awaited<ReturnType<typeof getSundayStandings>>
) {
  return rankStandings(
    rows.map((r) => ({ email: r.email, score: r.wins })),
    (r) => r.score
  );
}

/**
 * Resolve and award podium for a completed Pick'em league week.
 * When podium is disabled, returns legacy-compatible single-winner resolution.
 */
export async function resolvePickemLeaguePodium(input: {
  contestId: string;
  leagueId: string;
  contest: PickemContest;
  league: PickemLeague;
  winnerEmails: string[];
  splitEqually: boolean;
  tiebreakerUsed: boolean;
}): Promise<PickemLeaguePodiumResult> {
  const config = await getPodiumConfig();
  const sunday = await getSundayStandings({
    contestId: input.contestId,
    leagueId: input.leagueId,
  });

  const ranked = standingsFromSunday(sunday);
  const resolution = resolvePodium({
    standings: ranked,
    nearPerfectConfig: config.nearPerfect,
    firstPlaceEmails: input.winnerEmails,
  });

  if (!config.enabled) {
    const legacyAward: PodiumAwardResult = {
      payouts: [],
      recordsStored: 0,
      eventsPublished: 0,
      errors: [],
    };
    return { resolution, award: legacyAward, podiumEnabled: false };
  }

  const award = await awardPodiumWithDefaults({
    contestKind: "pickem_weekly",
    contestId: input.contestId,
    leagueId: input.leagueId,
    sport: input.contest.sport,
    seasonYear: input.contest.seasonYear,
    prizePoolCents: input.league.prizePoolCents,
    resolution,
    label: `${input.contest.label} · Pool #${input.league.leagueNumber}`,
  });

  await persistPickemWeekPodiumResults({
    contestId: input.contestId,
    leagueId: input.leagueId,
    contest: input.contest,
    league: input.league,
    resolution,
    award,
    tiebreakerUsed: input.tiebreakerUsed,
    splitEqually: input.splitEqually,
  });

  await processLeaguePodiumPayouts({
    contestId: input.contestId,
    leagueId: input.leagueId,
    payouts: award.payouts,
  });

  return { resolution, award, podiumEnabled: true };
}

async function persistPickemWeekPodiumResults(input: {
  contestId: string;
  leagueId: string;
  contest: PickemContest;
  league: PickemLeague;
  resolution: PodiumResolution;
  award: PodiumAwardResult;
  tiebreakerUsed: boolean;
  splitEqually: boolean;
}): Promise<void> {
  const existing = await listPlayerWeekResultsForLeague(input.leagueId);
  const payoutByEmail = new Map(
    input.award.payouts.map((p) => [p.email.toLowerCase(), p])
  );

  for (const placement of input.resolution.placements) {
    const email = normalizeEmail(placement.email);
    const row =
      existing.find((r) => r.email === email) ??
      ({
        contestId: input.contestId,
        leagueId: input.leagueId,
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
      ? input.splitEqually
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

    if (isFirst) {
      await recordPickemPodiumStats({
        email,
        sport: input.contest.sport,
        seasonYear: input.contest.seasonYear,
        earningsCents: payout?.amountCents ?? 0,
        tiebreakerWin: input.tiebreakerUsed && !input.splitEqually,
        weeklyRecord: row.sundayRecord,
        placement: 1,
      });
    } else {
      await recordPickemPodiumStats({
        email,
        sport: input.contest.sport,
        seasonYear: input.contest.seasonYear,
        earningsCents: payout?.amountCents ?? 0,
        tiebreakerWin: false,
        weeklyRecord: row.sundayRecord,
        placement: placement.placement,
      });
    }

    await savePickemWeekHistory({
      email,
      contestId: input.contestId,
      leagueId: input.leagueId,
      sport: input.contest.sport,
      seasonYear: input.contest.seasonYear,
      weekLabel: input.contest.label,
      entryTierCents: input.league.entryTierCents,
      poolNumber: input.league.leagueNumber,
      weeklyRecord: row.sundayRecord,
      finishPlace: placement.placement,
      status,
      earningsCents: payout?.amountCents ?? 0,
      tiebreakerUsed: input.tiebreakerUsed && isFirst,
    });
  }

  for (const near of input.resolution.nearPerfect) {
    const email = normalizeEmail(near.email);
    const row = existing.find((r) => r.email === email);
    if (!row) continue;

    await savePickemWeekHistory({
      email,
      contestId: input.contestId,
      leagueId: input.leagueId,
      sport: input.contest.sport,
      seasonYear: input.contest.seasonYear,
      weekLabel: input.contest.label,
      entryTierCents: input.league.entryTierCents,
      poolNumber: input.league.leagueNumber,
      weeklyRecord: row.sundayRecord,
      finishPlace: near.rank,
      status: "near_perfect",
      earningsCents: 0,
      tiebreakerUsed: false,
    });
  }
}

/** Season championship podium — prestige rewards, no league cash pool. */
export async function resolvePickemSeasonPodium(input: {
  sport: PickemSport;
  seasonYear: number;
  archiveId: string;
}): Promise<PodiumAwardResult | null> {
  const config = await getPodiumConfig();
  if (!config.enabled) return null;

  const stats = await listPickemStatsForLeaderboard({
    sport: input.sport,
    seasonYear: input.seasonYear,
    limit: 100,
  });

  if (stats.length < 3) return null;

  const ranked = rankStandings(
    stats.map((s) => ({
      email: s.email,
      score: s.seasonWins * 1000 + s.pickAccuracyPct,
    }))
  );

  const resolution = resolvePodium({
    standings: ranked,
    nearPerfectConfig: config.nearPerfect,
  });

  return awardPodiumWithDefaults({
    contestKind: "pickem_season",
    contestId: input.archiveId,
    sport: input.sport,
    seasonYear: input.seasonYear,
    prizePoolCents: 0,
    resolution,
    label: `${input.sport.toUpperCase()} Pick'em ${input.seasonYear} Season`,
  });
}
