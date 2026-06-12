import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { fetchPickemScoreboard } from "@/lib/pickem/espnSchedule";
import {
  getCurrentPickemContest,
  getPickemContestForWeek,
  refreshPickemContestPlayerCount,
  updatePickemContestStatus,
  upsertPickemContest,
} from "@/lib/pickem/db/contests";
import {
  lockPickemGamesPastKickoff,
  listPickemGames,
  upsertPickemGames,
} from "@/lib/pickem/db/games";
import { gradePicksForGame, lockPicksForGame } from "@/lib/pickem/db/picks";
import { recomputeWeeklyStatsForPlayer } from "@/lib/pickem/db/stats";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PickemSport } from "@/lib/pickem/types";

export interface PickemSyncResult {
  sport: PickemSport;
  contestId: string;
  weekNumber: number;
  gamesImported: number;
  gamesLocked: number;
  picksGraded: number;
  contestStatus: string;
  errors: string[];
}

export async function syncPickemContest(
  sport: PickemSport = DEFAULT_PICKEM_SPORT
): Promise<PickemSyncResult> {
  const errors: string[] = [];
  const { meta, games } = await fetchPickemScoreboard({ sport });

  const existing = await getPickemContestForWeek({
    sport,
    seasonYear: meta.seasonYear,
    seasonType: meta.seasonType,
    weekNumber: meta.weekNumber,
  });

  const contest = await upsertPickemContest({
    sport,
    seasonYear: meta.seasonYear,
    seasonType: meta.seasonType,
    weekNumber: meta.weekNumber,
    status: games.some((g) => g.status === "live") ? "active" : "open",
  });

  const imported = await upsertPickemGames(contest.id, games);
  const gamesLocked = await lockPickemGamesPastKickoff(contest.id);

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

  const allFinal =
    imported.length > 0 && imported.every((g) => g.status === "final");
  const anyLive = imported.some((g) => g.status === "live");

  if (allFinal) {
    if (existing?.status !== "complete") {
      await finalizePickemContestStats(contest.id, sport, meta.seasonYear);
    }
    await updatePickemContestStatus(contest.id, "complete");
  } else if (anyLive) {
    await updatePickemContestStatus(contest.id, "active");
  }

  await refreshPickemContestPlayerCount(contest.id);

  const refreshed = await getCurrentPickemContest(sport);

  return {
    sport,
    contestId: contest.id,
    weekNumber: meta.weekNumber,
    gamesImported: imported.length,
    gamesLocked,
    picksGraded,
    contestStatus: refreshed?.status ?? contest.status,
    errors,
  };
}

async function finalizePickemContestStats(
  contestId: string,
  sport: PickemSport,
  seasonYear: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: players, error } = await supabase
    .from("pickem_picks")
    .select("email")
    .eq("contest_id", contestId);

  if (error) throw error;

  const emails = Array.from(new Set((players ?? []).map((p) => p.email as string)));
  for (const email of emails) {
    await recomputeWeeklyStatsForPlayer({
      email,
      sport,
      seasonYear,
      contestId,
    });
  }
}

export async function ensureCurrentPickemContest(
  sport: PickemSport = DEFAULT_PICKEM_SPORT
) {
  let contest = await getCurrentPickemContest(sport);
  if (contest) return contest;
  await syncPickemContest(sport);
  return getCurrentPickemContest(sport);
}
