import { TABLES } from "@/lib/database/config";
import type { GameRow, PlayerRow, PoolRow, WinnerRow } from "@/lib/database/types";
import type {
  BigWinToday,
  ChampionEntry,
  LiveActivityItem,
  LiveGameStatus,
  LivePlatformStatus,
  LiveWinnerFeedItem,
  LiveWinnersCenterData,
  LiveWinnersStats,
  TickerPayout,
} from "@/lib/liveWinners/types";
import {
  getActivityAccent,
  periodBadgeLabel,
  periodShortLabel,
} from "@/lib/liveWinners/display";
import { buildStreakMilestoneActivity } from "@/lib/liveWinners/streakActivity";
import { WIN_STREAK_WINDOW_DAYS } from "@/lib/player/statsCore";
import { parseEspnSummary } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { EspnLiveGame, EspnSport, PoolStatus, ScoringPeriod } from "@/lib/types";

const SPORT_LABELS: Record<string, string> = {
  nfl: "NFL",
  ncaaf: "NCAAF",
  nba: "NBA",
  ncaab: "NCAAB",
};

const ACTIVE_POOL_STATUSES: PoolStatus[] = ["open", "locked", "numbers-drawn"];

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function sportLabel(sport: EspnSport | null | undefined): string {
  if (!sport) return "Sports";
  return SPORT_LABELS[sport] ?? sport.toUpperCase();
}

export function maskWinnerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Player";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

function classifyGameStatus(
  pool: PoolRow | undefined,
  espnGame: EspnLiveGame | null
): LiveGameStatus | null {
  if (!pool) return null;
  if (pool.status === "completed" || pool.status === "archived") return "final";
  if (espnGame?.gameCompleted) return "final";

  const kickoffPast =
    pool.kickoff_at && new Date(pool.kickoff_at).getTime() <= Date.now();

  if (espnGame && !espnGame.gameCompleted) return "live";
  if (kickoffPast && ACTIVE_POOL_STATUSES.includes(pool.status)) return "live";
  if (pool.kickoff_at && !kickoffPast) return "upcoming";
  return null;
}

async function fetchEspnGameServer(
  gameId: string,
  sport: EspnSport
): Promise<EspnLiveGame | null> {
  try {
    const config = getEspnSportConfig(sport);
    const response = await fetch(`${config.summaryUrl}?event=${gameId}`, {
      headers: { "User-Agent": "SquareBoards/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return parseEspnSummary(data, gameId);
  } catch {
    return null;
  }
}

async function loadEspnGames(pools: PoolRow[]): Promise<Map<string, EspnLiveGame>> {
  const map = new Map<string, EspnLiveGame>();
  const unique = new Map<string, EspnSport>();

  for (const pool of pools) {
    if (!pool.espn_game_id) continue;
    if (pool.status === "completed" || pool.status === "archived") continue;
    unique.set(pool.espn_game_id, pool.espn_sport);
    if (unique.size >= 12) break;
  }

  await Promise.all(
    Array.from(unique.entries()).map(async ([gameId, sport]) => {
      const game = await fetchEspnGameServer(gameId, sport);
      if (game) map.set(gameId, game);
    })
  );

  return map;
}

function buildChampions(
  winners: WinnerRow[],
  sinceIso: string
): ChampionEntry[] {
  const totals = new Map<string, number>();

  for (const winner of winners) {
    if (new Date(winner.created_at) < new Date(sinceIso)) continue;
    const amount = winner.payout_amount ?? 0;
    if (amount <= 0) continue;
    const key = winner.winning_player.trim().toLowerCase();
    totals.set(key, (totals.get(key) ?? 0) + amount);
  }

  return Array.from(totals.entries())
    .map(([key, totalWon]) => ({
      maskedName: maskWinnerName(
        winners.find((w) => w.winning_player.trim().toLowerCase() === key)
          ?.winning_player ?? key
      ),
      totalWon: Math.round(totalWon),
    }))
    .sort((a, b) => b.totalWon - a.totalWon)
    .slice(0, 5);
}

function buildBigWinToday(
  todaysWinners: WinnerRow[],
  poolById: Map<string, PoolRow>
): BigWinToday | null {
  const candidates = todaysWinners.filter(
    (w) => (w.payout_amount ?? 0) > 0 && w.payout_status === "paid"
  );
  if (!candidates.length) return null;

  const biggest = candidates.reduce((best, current) =>
    (current.payout_amount ?? 0) > (best.payout_amount ?? 0) ? current : best
  );
  const pool = poolById.get(biggest.pool_id);

  return {
    id: biggest.id,
    amount: biggest.payout_amount ?? 0,
    awayTeam: pool?.away_team ?? "Away",
    homeTeam: pool?.home_team ?? "Home",
    boardIndex: pool?.board_index ?? 1,
    paidAt: biggest.created_at,
    maskedWinner: maskWinnerName(biggest.winning_player),
  };
}

function buildTicker(winners: WinnerRow[]): TickerPayout[] {
  return winners
    .filter((w) => w.payout_status === "paid" && (w.payout_amount ?? 0) > 0)
    .slice(0, 20)
    .map((w) => ({ id: w.id, amount: w.payout_amount ?? 0 }));
}

function emptyData(): LiveWinnersCenterData {
  return {
    platform: {
      platformOnline: true,
      activeGames: 0,
      activeBoards: 0,
      playersOnline: 0,
      squaresPurchasedToday: 0,
      automaticPayoutsToday: 0,
      prizeMoneyPaidToday: 0,
      gamesCurrentlyLive: 0,
    },
    stats: {
      todaysWinners: 0,
      todaysPayouts: 0,
      boardsPlayed: 0,
      squaresSold: 0,
      prizeMoneyToday: 0,
    },
    bigWin: null,
    ticker: [],
    winners: [],
    activity: [],
    champions: { today: [], week: [], month: [] },
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveWinnersCenterData(): Promise<LiveWinnersCenterData> {
  if (!isSupabaseAdminConfigured()) return emptyData();

  const supabase = getSupabaseAdmin();
  const todayStart = startOfToday();
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);
  const activitySince = daysAgo(2);
  const streakSince = daysAgo(WIN_STREAK_WINDOW_DAYS);
  const recentSince = hoursAgo(3);

  const [winnersRes, streakWinnersRes, poolsRes, playersRes, gamesRes] = await Promise.all([
    supabase
      .from(TABLES.winners)
      .select("*")
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from(TABLES.winners)
      .select("*")
      .gte("created_at", streakSince)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from(TABLES.pools).select("*").order("created_at", { ascending: false }).limit(150),
    supabase
      .from(TABLES.players)
      .select("*")
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(120),
    supabase.from(TABLES.games).select("*").order("kickoff_at", { ascending: false }).limit(80),
  ]);

  if (winnersRes.error) throw winnersRes.error;
  if (streakWinnersRes.error) throw streakWinnersRes.error;
  if (poolsRes.error) throw poolsRes.error;
  if (playersRes.error) throw playersRes.error;
  if (gamesRes.error) throw gamesRes.error;

  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];
  const streakWinnerRows = (streakWinnersRes.data ?? []) as WinnerRow[];
  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const playerRows = (playersRes.data ?? []) as PlayerRow[];
  const gameRows = (gamesRes.data ?? []) as GameRow[];

  const poolById = new Map(poolRows.map((p) => [p.id, p]));
  const espnGames = await loadEspnGames(poolRows);

  const todaysWinners = winnerRows.filter(
    (w) => new Date(w.created_at) >= new Date(todayStart)
  );
  const todaysPaid = todaysWinners.filter((w) => w.payout_status === "paid");
  const prizeMoneyToday = todaysWinners.reduce(
    (sum, w) => sum + (w.payout_amount ?? 0),
    0
  );
  const prizeMoneyPaidToday = todaysPaid.reduce(
    (sum, w) => sum + (w.payout_amount ?? 0),
    0
  );

  const activeBoards = poolRows.filter((p) =>
    ACTIVE_POOL_STATUSES.includes(p.status)
  ).length;

  const activeGameIds = new Set(
    poolRows
      .filter((p) => ACTIVE_POOL_STATUSES.includes(p.status))
      .map((p) => p.espn_game_id ?? p.game_id)
      .filter(Boolean)
  );

  const gamesCurrentlyLive =
    gameRows.filter((g) => g.status === "live").length ||
    poolRows.filter((p) => {
      if (!ACTIVE_POOL_STATUSES.includes(p.status)) return false;
      if (!p.kickoff_at) return false;
      const espn = p.espn_game_id ? espnGames.get(p.espn_game_id) : null;
      return espn ? !espn.gameCompleted : new Date(p.kickoff_at) <= new Date();
    }).length;

  const playersOnline = new Set(
    playerRows
      .filter((p) => new Date(p.created_at) >= new Date(recentSince))
      .map((p) => (p.email ?? p.name).trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const squaresPurchasedToday = playerRows
    .filter((p) => new Date(p.created_at) >= new Date(todayStart))
    .reduce((sum, p) => sum + (p.credits_allocated ?? 0), 0);

  const platform: LivePlatformStatus = {
    platformOnline: true,
    activeGames: activeGameIds.size || gameRows.filter((g) => g.status !== "final").length,
    activeBoards,
    playersOnline,
    squaresPurchasedToday,
    automaticPayoutsToday: todaysPaid.length,
    prizeMoneyPaidToday: Math.round(prizeMoneyPaidToday),
    gamesCurrentlyLive,
  };

  const stats: LiveWinnersStats = {
    todaysWinners: todaysWinners.length,
    todaysPayouts: todaysPaid.length,
    boardsPlayed: new Set(todaysWinners.map((w) => w.pool_id)).size,
    squaresSold: squaresPurchasedToday,
    prizeMoneyToday: Math.round(prizeMoneyToday),
  };

  const winners: LiveWinnerFeedItem[] = winnerRows.slice(0, 24).map((winner) => {
    const pool = poolById.get(winner.pool_id);
    const espnGame = pool?.espn_game_id
      ? espnGames.get(pool.espn_game_id) ?? null
      : null;
    const gameStatus = classifyGameStatus(pool, espnGame);

    return {
      id: winner.id,
      sport: sportLabel(pool?.espn_sport),
      sportKey: pool?.espn_sport ?? null,
      awayTeam: pool?.away_team ?? "Away",
      homeTeam: pool?.home_team ?? "Home",
      boardIndex: pool?.board_index ?? 1,
      quarter: winner.quarter,
      periodLabel: periodBadgeLabel(winner.quarter),
      periodShort: periodShortLabel(winner.quarter),
      amount: winner.payout_amount ?? 0,
      maskedWinner: maskWinnerName(winner.winning_player),
      payoutStatus: winner.payout_status,
      wonAt: winner.created_at,
      homeScore: winner.home_score,
      awayScore: winner.away_score,
      winningSquare: winner.winning_square,
      gameStatus,
      livePeriod: espnGame?.period ?? null,
      liveClock: espnGame?.statusDetail ?? null,
      liveHomeScore: espnGame?.homeScore ?? null,
      liveAwayScore: espnGame?.awayScore ?? null,
    };
  });

  const activity: LiveActivityItem[] = [];

  for (const winner of winnerRows.slice(0, 24)) {
    const pool = poolById.get(winner.pool_id);
    const matchup = pool
      ? `${pool.away_team} vs ${pool.home_team}`
      : "Game board";
    const isFinal = winner.quarter === "FINAL";

    activity.push({
      id: `win-${winner.id}`,
      type: isFinal ? "final_winner" : "quarter_winner",
      title: isFinal ? "Final Winner Calculated" : "Quarter Winner Calculated",
      detail: `${matchup} · ${periodBadgeLabel(winner.quarter)} · ${maskWinnerName(winner.winning_player)}`,
      at: winner.created_at,
      accent: getActivityAccent(isFinal ? "final_winner" : "quarter_winner"),
    });

    if (winner.payout_status === "paid") {
      activity.push({
        id: `pay-${winner.id}`,
        type: isFinal ? "final_winner" : "payout_sent",
        title: isFinal ? "Final Winner Paid" : "Automatic Stripe Payout Sent",
        detail: `${formatAmount(winner.payout_amount ?? 0)} → ${maskWinnerName(winner.winning_player)}`,
        at: winner.created_at,
        accent: "green",
      });
    } else if (winner.payout_status === "pending") {
      activity.push({
        id: `proc-${winner.id}`,
        type: "payout_sent",
        title: "Payout Processing",
        detail: `${formatAmount(winner.payout_amount ?? 0)} for ${maskWinnerName(winner.winning_player)}`,
        at: winner.created_at,
        accent: "yellow",
      });
    }
  }

  for (const pool of poolRows.slice(0, 40)) {
    const matchup = `${pool.away_team} vs ${pool.home_team}`;
    const createdAt = pool.created_at;

    if (pool.marketplace_visible && new Date(createdAt) >= new Date(activitySince)) {
      activity.push({
        id: `opened-${pool.id}`,
        type: "game_opened",
        title: "New Game Opened",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: createdAt,
        accent: "blue",
      });
    }

    if (pool.auto_created && new Date(createdAt) >= new Date(activitySince)) {
      activity.push({
        id: `created-${pool.id}`,
        type: "board_created",
        title: "New Board Created",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: createdAt,
        accent: "purple",
      });
    }

    if (pool.status === "locked" && pool.locked_at) {
      activity.push({
        id: `locked-${pool.id}`,
        type: "board_filled",
        title: "Board Filled",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: pool.locked_at,
        accent: "green",
      });
    }

    if (pool.status === "numbers-drawn") {
      activity.push({
        id: `numbers-${pool.id}`,
        type: "numbers_assigned",
        title: "Numbers Assigned",
        detail: `${matchup} · Board #${pool.board_index ?? 1}`,
        at: pool.locked_at ?? createdAt,
        accent: "blue",
      });
    }

    if (pool.kickoff_at && new Date(pool.kickoff_at) >= new Date(activitySince)) {
      activity.push({
        id: `kickoff-${pool.id}`,
        type: "kickoff_started",
        title: "Kickoff Started",
        detail: matchup,
        at: pool.kickoff_at,
        accent: "red",
      });
    }
  }

  for (const player of playerRows.slice(0, 24)) {
    if (player.purchase_source !== "stripe") continue;
    const pool = poolById.get(player.pool_id);
    activity.push({
      id: `purchase-${player.id}`,
      type: "squares_purchased",
      title: `${player.credits_allocated} Squares Purchased`,
      detail: pool
        ? `${pool.away_team} vs ${pool.home_team}`
        : "SquareBoards marketplace",
      at: player.created_at,
      accent: "purple",
    });
  }

  activity.push(...buildStreakMilestoneActivity(streakWinnerRows, activitySince));

  activity.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const allWinnersForChampions = winnerRows.length
    ? winnerRows
    : ((await supabase.from(TABLES.winners).select("*").limit(200)).data ??
        []) as WinnerRow[];

  return {
    platform,
    stats,
    bigWin: buildBigWinToday(todaysWinners, poolById),
    ticker: buildTicker(winnerRows),
    winners,
    activity: activity.slice(0, 30),
    champions: {
      today: buildChampions(allWinnersForChampions, todayStart),
      week: buildChampions(allWinnersForChampions, weekStart),
      month: buildChampions(allWinnersForChampions, monthStart),
    },
    updatedAt: new Date().toISOString(),
  };
}

function formatAmount(amount: number): string {
  return `$${amount.toFixed(0)}`;
}
