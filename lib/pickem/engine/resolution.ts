import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { listPickemGames } from "@/lib/pickem/db/games";
import {
  getPickemLeagueById,
  listPickemLeaguesForContest,
  updatePickemLeagueResolutionStatus,
} from "@/lib/pickem/db/leagues";
import {
  countTiebreakerPlayers,
  listPlayerWeekResultsForLeague,
  upsertPlayerWeekResult,
} from "@/lib/pickem/db/playerWeekResults";
import {
  createTiebreaker,
  ensureTiebreakerEntry,
  getTiebreakerForLeague,
  listTiebreakerEntries,
  lockTiebreakerEntries,
  setTiebreakerEntryDistances,
  updateTiebreakerStatus,
} from "@/lib/pickem/db/tiebreakers";
import { savePickemWeekHistory } from "@/lib/pickem/db/history";
import { getSundayStandings } from "@/lib/pickem/db/stats";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import {
  allSundaySlateGamesFinal,
  getMondayNightGame,
  mondayGameCombinedScore,
} from "@/lib/pickem/mondayNight";
import {
  processLeagueWinnerPayouts,
  recordPickemWinStats,
} from "@/lib/pickem/payouts";
import type { PickemPlayerWeekStatus } from "@/lib/pickem/types";

export interface ContestResolutionResult {
  contestId: string;
  leaguesProcessed: number;
  tiebreakersCreated: number;
  winnersDeclared: number;
  splitsDeclared: number;
  errors: string[];
}

/**
 * Automated weekly resolution:
 * Sunday slate complete → rank players → tiebreaker or winner → MNF resolve → Stripe payout.
 */
export async function processContestResolution(
  contestId: string
): Promise<ContestResolutionResult> {
  const errors: string[] = [];
  let tiebreakersCreated = 0;
  let winnersDeclared = 0;
  let splitsDeclared = 0;

  const contest = await getPickemContestById(contestId);
  if (!contest) {
    return {
      contestId,
      leaguesProcessed: 0,
      tiebreakersCreated: 0,
      winnersDeclared: 0,
      splitsDeclared: 0,
      errors: ["Contest not found"],
    };
  }

  const games = await listPickemGames(contestId);
  const mondayGame = getMondayNightGame(games);
  const sundayComplete = allSundaySlateGamesFinal(games);
  const mondayFinal = mondayGame?.status === "final";

  const leagues = await listPickemLeaguesForContest(contestId);
  let leaguesProcessed = 0;

  for (const league of leagues) {
    if (league.playerCount <= 0) continue;
    if (league.resolutionStatus === "complete") continue;

    try {
      if (league.resolutionStatus === "tiebreaker_active") {
        if (!mondayFinal) {
          await maybeLockTiebreakerPredictions(league.id, mondayGame);
          leaguesProcessed += 1;
          continue;
        }

        const result = await resolveMondayTiebreaker({
          contestId,
          leagueId: league.id,
          mondayGame,
          contest,
        });
        if (result.split) splitsDeclared += 1;
        else if (result.winners.length) winnersDeclared += result.winners.length;
        leaguesProcessed += 1;
        continue;
      }

      if (!sundayComplete) continue;

      const outcome = await processSundayCompletion({
        contestId,
        leagueId: league.id,
        mondayGameId: mondayGame?.id ?? null,
        contest,
      });

      if (outcome.tiebreakerCreated) tiebreakersCreated += 1;
      if (outcome.singleWinner) winnersDeclared += 1;
      if (outcome.splitWinners) splitsDeclared += outcome.splitWinners;

      leaguesProcessed += 1;
    } catch (err) {
      errors.push(
        err instanceof Error
          ? `League ${league.leagueNumber}: ${err.message}`
          : `League ${league.leagueNumber}: resolution failed`
      );
    }
  }

  return {
    contestId,
    leaguesProcessed,
    tiebreakersCreated,
    winnersDeclared,
    splitsDeclared,
    errors,
  };
}

async function processSundayCompletion(input: {
  contestId: string;
  leagueId: string;
  mondayGameId: string | null;
  contest: Awaited<ReturnType<typeof getPickemContestById>>;
}): Promise<{
  tiebreakerCreated: boolean;
  singleWinner: boolean;
  splitWinners: number;
}> {
  const league = await getPickemLeagueById(input.leagueId);
  if (
    !league ||
    league.resolutionStatus === "complete" ||
    league.resolutionStatus === "tiebreaker_active" ||
    league.resolutionStatus === "payout_pending"
  ) {
    return { tiebreakerCreated: false, singleWinner: false, splitWinners: 0 };
  }

  const standings = await getSundayStandings({
    contestId: input.contestId,
    leagueId: input.leagueId,
  });

  if (!standings.length) {
    return { tiebreakerCreated: false, singleWinner: false, splitWinners: 0 };
  }

  const topWins = standings[0].wins;
  const leaders = standings.filter((s) => s.wins === topWins);

  for (const player of standings) {
    const isLeader = player.wins === topWins;
    await upsertPlayerWeekResult({
      contestId: input.contestId,
      leagueId: input.leagueId,
      email: player.email,
      sundayWins: player.wins,
      sundayLosses: player.losses,
      sundayRecord: `${player.wins}-${player.losses}`,
      status: isLeader ? "active" : "eliminated",
      finishPlace: null,
      payoutCents: 0,
    });
  }

  await updatePickemLeagueResolutionStatus(input.leagueId, "sunday_complete");

  if (leaders.length === 1) {
    await declareWinners({
      contestId: input.contestId,
      leagueId: input.leagueId,
      winnerEmails: [leaders[0].email],
      splitEqually: false,
      tiebreakerUsed: false,
      contest: input.contest!,
      league,
    });
    return { tiebreakerCreated: false, singleWinner: true, splitWinners: 0 };
  }

  if (!input.mondayGameId) {
    await promoteToTiebreakerStatus(input.contestId, input.leagueId, leaders);
    await declareWinners({
      contestId: input.contestId,
      leagueId: input.leagueId,
      winnerEmails: leaders.map((l) => l.email),
      splitEqually: true,
      tiebreakerUsed: false,
      contest: input.contest!,
      league,
    });
    return { tiebreakerCreated: false, singleWinner: false, splitWinners: leaders.length };
  }

  await promoteToTiebreakerStatus(input.contestId, input.leagueId, leaders);
  await createTiebreaker({
    contestId: input.contestId,
    leagueId: input.leagueId,
    mondayGameId: input.mondayGameId,
  });

  for (const leader of leaders) {
    const tb = await getTiebreakerForLeague(input.leagueId);
    if (tb) await ensureTiebreakerEntry(tb.id, leader.email);
  }

  await updatePickemLeagueResolutionStatus(input.leagueId, "tiebreaker_active");
  return { tiebreakerCreated: true, singleWinner: false, splitWinners: 0 };
}

async function promoteToTiebreakerStatus(
  contestId: string,
  leagueId: string,
  leaders: Array<{ email: string }>
): Promise<void> {
  for (const leader of leaders) {
    const existing = await listPlayerWeekResultsForLeague(leagueId);
    const row = existing.find((r) => r.email === normalizeEmail(leader.email));
    if (!row) continue;
    await upsertPlayerWeekResult({
      ...row,
      status: "tiebreaker",
    });
  }
}

async function maybeLockTiebreakerPredictions(
  leagueId: string,
  mondayGame: ReturnType<typeof getMondayNightGame>
): Promise<void> {
  if (!mondayGame) return;
  const kickoff = new Date(mondayGame.kickoffAt).getTime();
  if (Date.now() < kickoff) return;

  const tb = await getTiebreakerForLeague(leagueId);
  if (!tb || tb.status === "locked" || tb.status === "complete" || tb.status === "split") {
    return;
  }

  await lockTiebreakerEntries(tb.id);
  await updateTiebreakerStatus(tb.id, "locked");
}

async function resolveMondayTiebreaker(input: {
  contestId: string;
  leagueId: string;
  mondayGame: ReturnType<typeof getMondayNightGame>;
  contest: NonNullable<Awaited<ReturnType<typeof getPickemContestById>>>;
}): Promise<{ winners: string[]; split: boolean }> {
  const tb = await getTiebreakerForLeague(input.leagueId);
  if (!tb || tb.status === "complete" || tb.status === "split") {
    return { winners: [], split: false };
  }

  const actualTotal = input.mondayGame
    ? mondayGameCombinedScore(input.mondayGame)
    : null;

  if (actualTotal == null) {
    return { winners: [], split: false };
  }

  await lockTiebreakerEntries(tb.id);
  const entries = await listTiebreakerEntries(tb.id);
  const withPredictions = entries.filter((e) => e.predictedTotal != null);

  if (!withPredictions.length) {
    const league = await getPickemLeagueById(input.leagueId);
    if (!league) return { winners: [], split: false };
    const tiedEmails = entries.map((e) => e.email);
    await declareWinners({
      contestId: input.contestId,
      leagueId: input.leagueId,
      winnerEmails: tiedEmails,
      splitEqually: true,
      tiebreakerUsed: true,
      contest: input.contest,
      league,
    });
    await updateTiebreakerStatus(tb.id, "split", {
      actualTotalPoints: actualTotal,
      winnerCount: tiedEmails.length,
      resolvedAt: new Date().toISOString(),
    });
    return { winners: tiedEmails, split: true };
  }

  const distances = withPredictions.map((e) => ({
    email: e.email,
    distance: Math.abs(e.predictedTotal! - actualTotal),
  }));

  await setTiebreakerEntryDistances(tb.id, distances);

  const minDistance = Math.min(...distances.map((d) => d.distance));
  const closest = distances.filter((d) => d.distance === minDistance);
  const league = await getPickemLeagueById(input.leagueId);
  if (!league) return { winners: [], split: false };

  const split = closest.length > 1;
  const winnerEmails = closest.map((c) => c.email);

  await declareWinners({
    contestId: input.contestId,
    leagueId: input.leagueId,
    winnerEmails,
    splitEqually: split,
    tiebreakerUsed: true,
    contest: input.contest,
    league,
  });

  await updateTiebreakerStatus(tb.id, split ? "split" : "complete", {
    actualTotalPoints: actualTotal,
    winnerCount: winnerEmails.length,
    resolvedAt: new Date().toISOString(),
  });

  return { winners: winnerEmails, split };
}

async function declareWinners(input: {
  contestId: string;
  leagueId: string;
  winnerEmails: string[];
  splitEqually: boolean;
  tiebreakerUsed: boolean;
  contest: NonNullable<Awaited<ReturnType<typeof getPickemContestById>>>;
  league: NonNullable<Awaited<ReturnType<typeof getPickemLeagueById>>>;
}): Promise<void> {
  const winnerCount = input.winnerEmails.length;
  const perPlayerCents = Math.floor(input.league.prizePoolCents / winnerCount);
  const status: PickemPlayerWeekStatus = input.splitEqually ? "prize_split" : "winner";

  for (const email of input.winnerEmails) {
    const results = await listPlayerWeekResultsForLeague(input.leagueId);
    const row =
      results.find((r) => r.email === normalizeEmail(email)) ??
      ({
        contestId: input.contestId,
        leagueId: input.leagueId,
        email,
        sundayWins: 0,
        sundayLosses: 0,
        sundayRecord: "0-0",
        status,
        finishPlace: 1,
        payoutCents: perPlayerCents,
      } as const);

    await upsertPlayerWeekResult({
      ...row,
      status,
      finishPlace: 1,
      payoutCents: perPlayerCents,
    });

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
      finishPlace: 1,
      status,
      earningsCents: perPlayerCents,
      tiebreakerUsed: input.tiebreakerUsed,
    });

    await recordPickemWinStats({
      email,
      sport: input.contest.sport,
      seasonYear: input.contest.seasonYear,
      earningsCents: perPlayerCents,
      tiebreakerWin: input.tiebreakerUsed && !input.splitEqually,
      weeklyRecord: row.sundayRecord,
    });
  }

  await processLeagueWinnerPayouts({
    contestId: input.contestId,
    leagueId: input.leagueId,
    winnerEmails: input.winnerEmails,
    amountCentsEach: perPlayerCents,
    splitEqually: input.splitEqually,
  });

  await updatePickemLeagueResolutionStatus(input.leagueId, "complete");

  const remaining = await countUnresolvedLeagues(input.contestId);
  if (remaining === 0) {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("pickem_contests")
      .update({
        status: "complete",
        payout_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.contestId);
  }
}

async function countUnresolvedLeagues(contestId: string): Promise<number> {
  const leagues = await listPickemLeaguesForContest(contestId);
  return leagues.filter(
    (l) => l.playerCount > 0 && l.resolutionStatus !== "complete"
  ).length;
}

export async function isContestFullyResolved(contestId: string): Promise<boolean> {
  return (await countUnresolvedLeagues(contestId)) === 0;
}
