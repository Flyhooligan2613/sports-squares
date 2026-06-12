import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  getCurrentPickemContest,
  getPickemContestById,
  getPickemContestForWeek,
  listActivePickemContests,
  refreshPickemContestPlayerCount,
  updatePickemContestStatus,
  upsertPickemContest,
} from "@/lib/pickem/db/contests";
import {
  lockPickemGamesPastKickoff,
  upsertPickemGames,
} from "@/lib/pickem/db/games";
import {
  gradePicksForGame,
  listDistinctPlayersForContest,
  lockPicksForGame,
} from "@/lib/pickem/db/picks";
import {
  listPickemLeaguesForContest,
  refreshPickemLeaguePlayerCount,
  ensurePickemLeaguesForAllTiers,
} from "@/lib/pickem/db/leagues";
import {
  recomputeLiveWeeklyStatsForPlayer,
  recomputeWeeklyStatsForPlayer,
  refreshContestWeeklySnapshots,
} from "@/lib/pickem/db/stats";
import { seedPickemSeason } from "@/lib/pickem/engine/seedSeason";
import {
  processPickemWeeklyPayouts,
  syncPickemProfileStats,
} from "@/lib/pickem/payouts";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PickemContest, PickemSport } from "@/lib/pickem/types";

function formatPickemSyncError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

export interface PickemSyncResult {
  sport: PickemSport;
  contestId: string;
  weekNumber: number;
  gamesImported: number;
  gamesLocked: number;
  picksGraded: number;
  contestStatus: string;
  seasonSeeded: boolean;
  contestsSynced: number;
  errors: string[];
}

export interface PickemFullSyncResult {
  sport: PickemSport;
  current: PickemSyncResult;
  seasonSeed: Awaited<ReturnType<typeof seedPickemSeason>>;
  additional: PickemSyncResult[];
}

async function syncSinglePickemContest(
  sport: PickemSport,
  contest: PickemContest,
  metaOverride?: {
    seasonYear: number;
    seasonType: number;
    weekNumber: number;
  }
): Promise<PickemSyncResult> {
  const errors: string[] = [];

  const { games } = await fetchPickemScoreboard({
    sport,
    week: contest.weekNumber,
    seasonType: contest.seasonType,
  });

  const existing = await getPickemContestForWeek({
    sport,
    seasonYear: contest.seasonYear,
    seasonType: contest.seasonType,
    weekNumber: contest.weekNumber,
  });

  const activeContest = await upsertPickemContest({
    sport,
    seasonYear: metaOverride?.seasonYear ?? contest.seasonYear,
    seasonType: metaOverride?.seasonType ?? contest.seasonType,
    weekNumber: metaOverride?.weekNumber ?? contest.weekNumber,
    label: contest.label,
    status: games.some((g) => g.status === "live") ? "active" : contest.status,
  });

  const imported = await upsertPickemGames(activeContest.id, games);
  await ensurePickemLeaguesForAllTiers(activeContest.id);
  const gamesLocked = await lockPickemGamesPastKickoff(activeContest.id);

  let picksGraded = 0;
  for (const game of imported) {
    if (game.status !== "final" || !game.winnerSide) continue;

    try {
      await lockPicksForGame(game.id);
      picksGraded += await gradePicksForGame({
        gameId: game.id,
        winnerSide: game.winnerSide,
      });
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : `Grade failed for ${game.espnGameId}`
      );
    }
  }

  if (picksGraded > 0 || gamesLocked > 0) {
    await refreshLiveContestStats(activeContest.id, sport, activeContest.seasonYear);
  }

  const allFinal =
    imported.length > 0 && imported.every((g) => g.status === "final");
  const anyLive = imported.some((g) => g.status === "live");

  if (allFinal && imported.length > 0) {
    const playerCount = existing?.playerCount ?? 0;
    const wasActive = existing?.status === "active" || anyLive;
    const shouldFinalize = playerCount > 0 || wasActive;

    if (existing?.status !== "complete" && shouldFinalize) {
      await finalizePickemContestStats(
        activeContest.id,
        sport,
        activeContest.seasonYear
      );

      if (playerCount > 0) {
        try {
          const payoutResult = await processPickemWeeklyPayouts(activeContest.id);
          for (const msg of payoutResult.errors) {
            errors.push(msg);
          }
        } catch (err) {
          errors.push(formatPickemSyncError(err, "Weekly payout processing failed."));
        }
      }
    }

    if (shouldFinalize) {
      await updatePickemContestStatus(activeContest.id, "complete");
    }
  } else if (anyLive) {
    await updatePickemContestStatus(activeContest.id, "active");
  }

  await refreshPickemContestPlayerCount(activeContest.id);
  const refreshedContest = await getPickemContestById(activeContest.id);
  const leagues = await listPickemLeaguesForContest(activeContest.id);
  for (const league of leagues) {
    await refreshPickemLeaguePlayerCount(league.id);
  }

  const refreshed = await getCurrentPickemContest(sport);
  const finalStatus = refreshedContest?.status ?? activeContest.status;

  return {
    sport,
    contestId: activeContest.id,
    weekNumber: activeContest.weekNumber,
    gamesImported: imported.length,
    gamesLocked,
    picksGraded,
    contestStatus:
      refreshed?.id === activeContest.id ? refreshed.status : finalStatus,
    seasonSeeded: false,
    contestsSynced: 1,
    errors,
  };
}

export async function syncPickemContest(
  sport: PickemSport = DEFAULT_PICKEM_SPORT
): Promise<PickemSyncResult> {
  const full = await syncAllPickemContests(sport);
  return full.current;
}

export async function syncAllPickemContests(
  sport: PickemSport = DEFAULT_PICKEM_SPORT
): Promise<PickemFullSyncResult> {
  const { meta, games } = await fetchPickemScoreboard({ sport });
  const seasonSeed = await seedPickemSeason(sport, meta.seasonYear);

  const currentContest = await upsertPickemContest({
    sport,
    seasonYear: meta.seasonYear,
    seasonType: meta.seasonType,
    weekNumber: meta.weekNumber,
    status: games.some((g) => g.status === "live") ? "active" : "open",
  });

  const current = await syncSinglePickemContest(sport, currentContest, meta);

  const activeContests = await listActivePickemContests(sport);
  const additional: PickemSyncResult[] = [];

  for (const contest of activeContests) {
    if (contest.id === current.contestId) continue;
    try {
      const result = await syncSinglePickemContest(sport, contest);
      additional.push(result);
    } catch (err) {
      additional.push({
        sport,
        contestId: contest.id,
        weekNumber: contest.weekNumber,
        gamesImported: 0,
        gamesLocked: 0,
        picksGraded: 0,
        contestStatus: contest.status,
        seasonSeeded: false,
        contestsSynced: 0,
        errors: [err instanceof Error ? err.message : "Sync failed."],
      });
    }
  }

  return {
    sport,
    current: { ...current, seasonSeeded: true, contestsSynced: 1 + additional.length },
    seasonSeed,
    additional,
  };
}

async function refreshLiveContestStats(
  contestId: string,
  sport: PickemSport,
  seasonYear: number
): Promise<void> {
  await refreshContestWeeklySnapshots(contestId);

  const leagues = await listPickemLeaguesForContest(contestId);
  for (const league of leagues) {
    await refreshContestWeeklySnapshots(contestId, league.id);
  }

  const emails = await listDistinctPlayersForContest(contestId);
  for (const email of emails) {
    await recomputeLiveWeeklyStatsForPlayer({
      email,
      sport,
      seasonYear,
      contestId,
    });
  }
}

async function finalizePickemContestStats(
  contestId: string,
  sport: PickemSport,
  seasonYear: number
): Promise<void> {
  const emails = await listDistinctPlayersForContest(contestId);

  for (const email of emails) {
    await recomputeWeeklyStatsForPlayer({
      email,
      sport,
      seasonYear,
      contestId,
    });
    await syncPickemProfileStats(email, sport, seasonYear);
  }

  await refreshContestWeeklySnapshots(contestId);
}

export async function ensureCurrentPickemContest(
  sport: PickemSport = DEFAULT_PICKEM_SPORT
) {
  let contest = await getCurrentPickemContest(sport);
  if (contest) return contest;

  await seedPickemSeason(sport);
  await syncPickemContest(sport);
  return getCurrentPickemContest(sport);
}

export async function listPickemWeeksForSeason(input: {
  sport: PickemSport;
  seasonYear: number;
}): Promise<PickemContest[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pickem_contests")
    .select("*")
    .eq("sport", input.sport)
    .eq("season_year", input.seasonYear)
    .order("season_type", { ascending: true })
    .order("week_number", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    sport: row.sport as PickemSport,
    seasonYear: row.season_year as number,
    seasonType: row.season_type as number,
    weekNumber: row.week_number as number,
    label: row.label as string,
    status: row.status as PickemContest["status"],
    prizePoolCents: row.prize_pool_cents as number,
    playerCount: row.player_count as number,
    payoutStatus: (row.payout_status as PickemContest["payoutStatus"]) ?? "none",
  }));
}
