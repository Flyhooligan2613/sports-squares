import {
  countRemainingPickemGames,
  listPickemGames,
} from "@/lib/pickem/db/games";
import { listUserPicksForContest } from "@/lib/pickem/db/picks";
import { getPickemPlayerStats } from "@/lib/pickem/db/stats";
import {
  getLongestActivePickemStreak,
  getPickemContestById,
} from "@/lib/pickem/db/contests";
import type {
  PickemContest,
  PickemGameView,
  PickemLiveSummary,
  PickemOverviewStats,
  PickemPickProgress,
  PickemSide,
  PickemSport,
  PickemWeekView,
} from "@/lib/pickem/types";
import type { PickemGame, PickemPick } from "@/lib/pickem/types";

function buildProgress(total: number, picks: PickemPick[]): PickemPickProgress {
  const completed = picks.length;
  const remaining = Math.max(0, total - completed);
  return {
    total,
    completed,
    remaining,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function resultStateForGame(
  game: PickemGame,
  userPick: PickemSide | null
): PickemGameView["resultState"] {
  if (!userPick) {
    return game.picksLocked ? "locked" : "unpicked";
  }
  if (game.status === "scheduled" && !game.picksLocked) return "pending";
  if (game.status === "live" || (game.picksLocked && game.status !== "final")) {
    return "pending";
  }
  if (game.status !== "final" || game.winnerSide == null) return "pending";
  if (game.winnerSide === "tie") return "pending";
  return userPick === game.winnerSide ? "correct" : "incorrect";
}

function buildLiveSummary(
  picks: PickemPick[],
  playerStats: PickemWeekView["playerStats"]
): PickemLiveSummary | null {
  const graded = picks.filter((p) => p.isCorrect != null);
  if (!graded.length && !picks.some((p) => p.lockedAt)) return null;

  const wins = picks.filter((p) => p.isCorrect === true).length;
  const losses = picks.filter((p) => p.isCorrect === false).length;

  return {
    weeklyRecord: `${wins}-${losses}`,
    currentStreak: playerStats?.currentStreak ?? 0,
    projectedWeeklyRank: null,
    projectedSeasonRank: null,
  };
}

export async function buildPickemWeekView(input: {
  contest: PickemContest;
  email?: string | null;
}): Promise<PickemWeekView> {
  const games = await listPickemGames(input.contest.id);
  const picks = input.email
    ? await listUserPicksForContest(input.contest.id, input.email)
    : [];

  const pickByGame = new Map(picks.map((p) => [p.gameId, p.pickedSide]));

  const gameViews: PickemGameView[] = games.map((game) => {
    const userPick = pickByGame.get(game.id) ?? null;
    return {
      ...game,
      userPick,
      resultState: resultStateForGame(game, userPick),
    };
  });

  const playerStats = input.email
    ? await getPickemPlayerStats(
        input.email,
        input.contest.sport,
        input.contest.seasonYear
      )
    : null;

  return {
    contest: input.contest,
    games: gameViews,
    progress: buildProgress(games.length, picks),
    playerStats,
    liveSummary: buildLiveSummary(picks, playerStats),
  };
}

export async function buildPickemOverview(
  sport: PickemSport,
  contest: PickemContest
): Promise<PickemOverviewStats> {
  const gamesRemaining = await countRemainingPickemGames(contest.id);
  const longestActiveStreak = await getLongestActivePickemStreak(
    sport,
    contest.seasonYear
  );

  return {
    playersThisWeek: contest.playerCount,
    prizePoolCents: contest.prizePoolCents,
    longestActiveStreak,
    seasonWeek: contest.weekNumber,
    gamesRemaining,
    contestLabel: contest.label,
  };
}

export async function buildPickemWeekViewByContestId(
  contestId: string,
  email?: string | null
): Promise<PickemWeekView | null> {
  const contest = await getPickemContestById(contestId);
  if (!contest) return null;
  return buildPickemWeekView({ contest, email });
}
