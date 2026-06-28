import {
  countRemainingPickemGames,
  listPickemGames,
} from "@/lib/pickem/db/games";
import { listUserPicksForContest } from "@/lib/pickem/db/picks";
import {
  getPickemPlayerStats,
  getSeasonRankForPlayer,
  getWeeklyRankForPlayer,
  recomputeLiveWeeklyStatsForPlayer,
} from "@/lib/pickem/db/stats";
import {
  hasPickemEntryForContest,
  pickemEntryAmountCents,
} from "@/lib/pickem/entryPurchase";
import {
  formatLeagueLabel,
  formatPoolLabel,
  getPlayerPickemLeague,
  listPickemLeaguesForContest,
} from "@/lib/pickem/db/leagues";
import { getPlayerWeekResult, countTiebreakerPlayers } from "@/lib/pickem/db/playerWeekResults";
import {
  getTiebreakerEntryForPlayer,
  getTiebreakerForLeague,
} from "@/lib/pickem/db/tiebreakers";
import { getMondayNightGame } from "@/lib/pickem/mondayNight";
import { PICKEM_LEAGUE_MAX_PLAYERS } from "@/lib/pickem/config";
import {
  getLongestActivePickemStreak,
  getPickemContestById,
} from "@/lib/pickem/db/contests";
import { isValidEntryTierCents } from "@/lib/platform/core/entryTiers";
import type {
  PickemContest,
  PickemGameView,
  PickemLiveSummary,
  PickemMyPicksSummary,
  PickemOverviewStats,
  PickemPickProgress,
  PickemPlayerPoolStatus,
  PickemPoolSummary,
  PickemSide,
  PickemSport,
  PickemTiebreakerView,
  PickemWeekView,
} from "@/lib/pickem/types";
import type { PickemGame, PickemPick, PickemPlayerStats } from "@/lib/pickem/types";

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

async function buildLiveSummary(input: {
  contest: PickemContest;
  picks: PickemPick[];
  playerStats: PickemPlayerStats | null;
  email: string;
  entryTierCents?: number;
}): Promise<PickemLiveSummary | null> {
  const { picks, playerStats, email, contest, entryTierCents } = input;

  if (!picks.length && !playerStats) return null;

  const wins = picks.filter((p) => p.isCorrect === true).length;
  const losses = picks.filter((p) => p.isCorrect === false).length;

  const league = await getPlayerPickemLeague(contest.id, email, entryTierCents);
  const leagueId = league?.id ?? picks[0]?.leagueId ?? null;

  const [weeklyRank, seasonRank] = await Promise.all([
    getWeeklyRankForPlayer({
      contestId: contest.id,
      email,
      leagueId,
    }),
    getSeasonRankForPlayer({
      sport: contest.sport,
      seasonYear: contest.seasonYear,
      email,
    }),
  ]);

  const stats = playerStats;

  return {
    weeklyRecord: `${wins}-${losses}`,
    seasonRecord: `${stats?.seasonWins ?? 0}-${stats?.seasonLosses ?? 0}`,
    currentStreak: stats?.currentStreak ?? 0,
    longestStreak: stats?.longestStreak ?? 0,
    pickAccuracyPct: stats?.pickAccuracyPct ?? 0,
    lifetimeRecord: `${stats?.lifetimeWins ?? 0}-${stats?.lifetimeLosses ?? 0}`,
    projectedWeeklyRank: weeklyRank,
    projectedSeasonRank: seasonRank,
    leagueLabel: league
      ? formatLeagueLabel(league.leagueNumber, league.entryTierCents)
      : null,
  };
}

function buildMyPicksSummary(
  playerStats: PickemPlayerStats | null,
  liveSummary: PickemLiveSummary | null
): PickemMyPicksSummary | null {
  if (!playerStats && !liveSummary) return null;

  const stats = playerStats;
  return {
    weeklyRecord: liveSummary?.weeklyRecord ?? `${stats?.weeklyWins ?? 0}-${stats?.weeklyLosses ?? 0}`,
    seasonRecord: liveSummary?.seasonRecord ?? `${stats?.seasonWins ?? 0}-${stats?.seasonLosses ?? 0}`,
    currentStreak: liveSummary?.currentStreak ?? stats?.currentStreak ?? 0,
    longestStreak: liveSummary?.longestStreak ?? stats?.longestStreak ?? 0,
    projectedWeeklyRank: liveSummary?.projectedWeeklyRank ?? null,
    projectedSeasonRank: liveSummary?.projectedSeasonRank ?? null,
    pickAccuracyPct: liveSummary?.pickAccuracyPct ?? stats?.pickAccuracyPct ?? 0,
    lifetimeRecord: liveSummary?.lifetimeRecord ?? `${stats?.lifetimeWins ?? 0}-${stats?.lifetimeLosses ?? 0}`,
    perfectWeeks: stats?.perfectWeeks ?? 0,
    weeksPlayed: stats?.weeksPlayed ?? 0,
    leagueLabel: liveSummary?.leagueLabel ?? null,
  };
}

export async function buildPickemWeekView(input: {
  contest: PickemContest;
  email?: string | null;
  entryTierCents?: number;
}): Promise<PickemWeekView> {
  const entryTierCents =
    input.entryTierCents != null && isValidEntryTierCents(input.entryTierCents)
      ? input.entryTierCents
      : 1000;

  const entryPaid = input.email
    ? await hasPickemEntryForContest({
        contestId: input.contest.id,
        email: input.email,
        entryTierCents,
      })
    : false;

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
      predictedCombinedTotal: null,
      resultState: resultStateForGame(game, userPick),
    };
  });

  let playerStats = input.email
    ? await getPickemPlayerStats(
        input.email,
        input.contest.sport,
        input.contest.seasonYear
      )
    : null;

  if (input.email && picks.length > 0) {
    playerStats = await recomputeLiveWeeklyStatsForPlayer({
      email: input.email,
      sport: input.contest.sport,
      seasonYear: input.contest.seasonYear,
      contestId: input.contest.id,
    });
  }

  const liveSummary = input.email
    ? await buildLiveSummary({
        contest: input.contest,
        picks,
        playerStats,
        email: input.email,
        entryTierCents,
      })
    : null;

  const pools = await buildPoolSummaries(input.contest.id, entryTierCents, games);

  const playerLeague = input.email
    ? await getPlayerPickemLeague(input.contest.id, input.email, entryTierCents)
    : null;

  const playerStatus = input.email
    ? await buildPlayerPoolStatus({
        contestId: input.contest.id,
        email: input.email,
        league: playerLeague,
      })
    : null;

  const tiebreaker = await buildTiebreakerView({
    contestId: input.contest.id,
    league: playerLeague,
    email: input.email ?? null,
    games,
  });

  return {
    contest: input.contest,
    games: gameViews,
    progress: buildProgress(games.length, picks),
    playerStats,
    liveSummary,
    myPicks: buildMyPicksSummary(playerStats, liveSummary),
    entry: {
      tierCents: entryTierCents,
      amountCents: pickemEntryAmountCents(entryTierCents),
      paid: entryPaid,
      requiresAuth: !input.email,
    },
    pools,
    playerStatus,
    tiebreaker,
  };
}

async function buildPoolSummaries(
  contestId: string,
  entryTierCents: number,
  games: Awaited<ReturnType<typeof listPickemGames>>
): Promise<PickemPoolSummary[]> {
  const leagues = await listPickemLeaguesForContest(contestId, entryTierCents);
  const nextKickoff = games.find((g) => g.status === "scheduled")?.kickoffAt ?? null;

  return leagues.map((league) => {
    const remainingSpots = Math.max(0, league.maxPlayers - league.playerCount);
    let poolStatusLabel = "Open";
    if (league.resolutionStatus === "tiebreaker_active") {
      poolStatusLabel = "Championship Tiebreaker";
    } else if (league.resolutionStatus === "complete") {
      poolStatusLabel = "Complete";
    } else if (league.status === "full") {
      poolStatusLabel = "Full";
    } else if (league.playerCount >= league.maxPlayers * 0.9) {
      poolStatusLabel = "Almost Full";
    }

    return {
      id: league.id,
      poolNumber: league.leagueNumber,
      playerCount: league.playerCount,
      maxPlayers: league.maxPlayers || PICKEM_LEAGUE_MAX_PLAYERS,
      remainingSpots,
      prizePoolCents: league.prizePoolCents,
      entryTierCents: league.entryTierCents,
      status: league.status,
      resolutionStatus: league.resolutionStatus,
      poolStatusLabel,
      label: formatPoolLabel(league.leagueNumber),
      nextKickoffAt: nextKickoff,
    };
  });
}

async function buildPlayerPoolStatus(input: {
  contestId: string;
  email: string;
  league: Awaited<ReturnType<typeof getPlayerPickemLeague>>;
}): Promise<PickemPlayerPoolStatus | null> {
  if (!input.league) return null;

  const result = await getPlayerWeekResult({
    contestId: input.contestId,
    leagueId: input.league.id,
    email: input.email,
  });

  return {
    status: result?.status ?? "active",
    sundayRecord: result?.sundayRecord ?? null,
    poolNumber: input.league.leagueNumber,
    poolLabel: formatPoolLabel(input.league.leagueNumber),
    finishPlace: result?.finishPlace ?? null,
    payoutCents: result?.payoutCents ?? null,
  };
}

async function buildTiebreakerView(input: {
  contestId: string;
  league: Awaited<ReturnType<typeof getPlayerPickemLeague>>;
  email: string | null;
  games: Awaited<ReturnType<typeof listPickemGames>>;
}): Promise<PickemTiebreakerView | null> {
  if (!input.league) return null;

  const tb = await getTiebreakerForLeague(input.league.id);
  if (!tb || tb.status === "pending") {
    return {
      active: false,
      tiebreakerId: null,
      status: null,
      mondayGame: getMondayNightGame(input.games),
      playersRemaining: 0,
      prizePoolCents: input.league.prizePoolCents,
      predictedTotal: null,
      locked: false,
      kickoffAt: getMondayNightGame(input.games)?.kickoffAt ?? null,
      actualTotal: null,
    };
  }

  const mondayGame = getMondayNightGame(input.games);
  const playersRemaining = await countTiebreakerPlayers(input.league.id);
  const locked = tb.status === "locked" || tb.status === "complete" || tb.status === "split";

  let predictedTotal: number | null = null;
  if (input.email && tb.id) {
    const entry = await getTiebreakerEntryForPlayer({
      tiebreakerId: tb.id,
      email: input.email,
    });
    predictedTotal = entry?.predictedTotal ?? null;
  }

  return {
    active: tb.status === "active" || tb.status === "locked",
    tiebreakerId: tb.id,
    status: tb.status,
    mondayGame,
    playersRemaining,
    prizePoolCents: input.league.prizePoolCents,
    predictedTotal,
    locked,
    kickoffAt: mondayGame?.kickoffAt ?? null,
    actualTotal: tb.actualTotalPoints,
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
