import {
  formatKickoffEstimate,
  formatPeriodLabel,
  formatTimelineTime,
  maskPlayerName,
  nextPayoutPeriod,
  periodDisplayLabel,
  estimateMinutesToPayout,
} from "@/lib/actionCenter/format";
import type {
  ActionCenterData,
  ActionGameBoard,
  ActionGameCard,
  ActionPlatformHealth,
  CountdownGame,
  FillingFastBoard,
  HotBadge,
  NextPayoutItem,
  NowHappeningCard,
  PurchaseFeedItem,
  SmartRecommendation,
  SportSummary,
  TimelineEvent,
} from "@/lib/actionCenter/types";
import { TABLES } from "@/lib/database/config";
import { dbListBoardsForGame } from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import type { GameRow, PlayerRow, PoolRow, WinnerRow } from "@/lib/database/types";
import { parseEspnSummary } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { getMarketplaceSportStats } from "@/lib/marketplace/listings";
import { getTemplatePercentages } from "@/lib/payoutTemplates";
import { calcPeriodPayouts } from "@/lib/poolFinance";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { EspnLiveGame, EspnSport, Game, ScoringPeriod } from "@/lib/types";

const ACTIVE_STATUSES = ["open", "locked", "numbers-drawn"] as const;
const SPORT_LABELS: Record<string, string> = {
  nfl: "NFL",
  ncaaf: "NCAAF",
  nba: "NBA",
  ncaab: "NCAAB",
};

interface FillStats {
  remaining: number;
  sold: number;
  fillPercent: number;
}

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function sportLabel(sport: EspnSport): string {
  return SPORT_LABELS[sport] ?? sport.toUpperCase();
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

async function batchFillStats(poolIds: string[]): Promise<Map<string, FillStats>> {
  const map = new Map<string, FillStats>();
  if (!poolIds.length) return map;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.squares)
    .select("pool_id, claimed")
    .in("pool_id", poolIds);

  if (error) throw error;

  const counts = new Map<string, { claimed: number; total: number }>();
  for (const row of data ?? []) {
    const poolId = row.pool_id as string;
    const current = counts.get(poolId) ?? { claimed: 0, total: 0 };
    current.total += 1;
    if (row.claimed) current.claimed += 1;
    counts.set(poolId, current);
  }

  for (const poolId of poolIds) {
    const stats = counts.get(poolId) ?? { claimed: 0, total: 100 };
    const sold = stats.claimed;
    const remaining = Math.max(stats.total - sold, 0);
    map.set(poolId, {
      sold,
      remaining,
      fillPercent: stats.total ? Math.round((sold / stats.total) * 100) : 0,
    });
  }

  return map;
}

function estimatePrizePool(pool: PoolRow, players: PlayerRow[]): number {
  const poolPlayers = players.filter((p) => p.pool_id === pool.id);
  const credits = poolPlayers.reduce((sum, p) => sum + (p.credits_allocated ?? 0), 0);
  const revenue = credits * (pool.cost_per_square ?? 0);
  const fee = revenue * ((pool.service_fee_percent ?? 0) / 100);
  return Math.round(revenue - fee);
}

function computeTrendingScore(input: {
  recentPurchases: number;
  squaresSold: number;
  isLive: boolean;
  minutesToKickoff: number;
  fillPercent: number;
}): number {
  let score = input.recentPurchases * 4 + input.squaresSold * 0.5 + input.fillPercent * 0.3;
  if (input.isLive) score += 60;
  if (input.minutesToKickoff >= 0 && input.minutesToKickoff <= 120) {
    score += (120 - input.minutesToKickoff) * 0.4;
  }
  if (input.fillPercent >= 85) score += 25;
  return Math.round(score);
}

function hotBadgeFromScore(score: number, fillPercent: number): HotBadge | null {
  if (fillPercent >= 90) return "selling_fast";
  if (score >= 80) return "hot";
  if (score >= 55) return "trending";
  return null;
}

function buildBoard(pool: PoolRow, fill: FillStats): ActionGameBoard {
  return {
    poolId: pool.id,
    boardIndex: pool.board_index ?? 1,
    squaresRemaining: fill.remaining,
    squaresSold: fill.sold,
    fillPercent: fill.fillPercent,
  };
}

function emptyData(): ActionCenterData {
  return {
    nowHappening: [],
    countdown: [],
    fillingFast: [],
    nextPayouts: [],
    hotGames: [],
    purchaseFeed: [],
    upcomingSports: [],
    timeline: [],
    recommendations: [],
    platform: {
      playersOnline: 0,
      gamesLive: 0,
      boardsRunning: 0,
      automaticPayoutsToday: 0,
      squaresSoldToday: 0,
      moneyAwardedToday: 0,
      moneyInPlay: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getActionCenterData(): Promise<ActionCenterData> {
  if (!isSupabaseAdminConfigured()) return emptyData();

  const supabase = getSupabaseAdmin();
  const todayStart = startOfToday();
  const recentSince = hoursAgo(3);
  const purchaseSince = hoursAgo(24);

  const [games, poolsRes, playersRes, winnersRes, sportStats] = await Promise.all([
    dbListGames({ status: ["scheduled", "live"] }),
    supabase
      .from(TABLES.pools)
      .select("*")
      .eq("marketplace_visible", true)
      .in("status", [...ACTIVE_STATUSES, "open"])
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from(TABLES.players)
      .select("*")
      .gte("created_at", purchaseSince)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from(TABLES.winners)
      .select("*")
      .gte("created_at", todayStart)
      .order("created_at", { ascending: true })
      .limit(80),
    getMarketplaceSportStats(),
  ]);

  if (poolsRes.error) throw poolsRes.error;
  if (playersRes.error) throw playersRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const playerRows = (playersRes.data ?? []) as PlayerRow[];
  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];

  const openPools = poolRows.filter((p) => p.status === "open");
  const fillByPool = await batchFillStats(openPools.map((p) => p.id));

  const espnKeys = new Map<string, EspnSport>();
  for (const game of games) {
    espnKeys.set(game.espnGameId, game.espnSport);
    if (espnKeys.size >= 20) break;
  }

  const espnById = new Map<string, EspnLiveGame>();
  await Promise.all(
    Array.from(espnKeys.entries()).map(async ([id, sport]) => {
      const live = await fetchEspnGameServer(id, sport);
      if (live) espnById.set(id, live);
    })
  );

  const poolsByGame = new Map<string, PoolRow[]>();
  for (const pool of poolRows) {
    if (!pool.game_id) continue;
    const list = poolsByGame.get(pool.game_id) ?? [];
    list.push(pool);
    poolsByGame.set(pool.game_id, list);
  }

  const recentPurchasesByGame = new Map<string, number>();
  const squaresSoldByGame = new Map<string, number>();
  for (const player of playerRows) {
    const pool = poolRows.find((p) => p.id === player.pool_id);
    if (!pool?.game_id) continue;
    if (new Date(player.created_at) >= new Date(recentSince)) {
      recentPurchasesByGame.set(
        pool.game_id,
        (recentPurchasesByGame.get(pool.game_id) ?? 0) + 1
      );
    }
    if (new Date(player.created_at) >= new Date(todayStart)) {
      squaresSoldByGame.set(
        pool.game_id,
        (squaresSoldByGame.get(pool.game_id) ?? 0) + (player.credits_allocated ?? 0)
      );
    }
  }

  const gameCards: ActionGameCard[] = [];

  for (const game of games) {
    const espn = espnById.get(game.espnGameId) ?? null;
    const kickoffMs = new Date(game.kickoffAt).getTime() - Date.now();
    const minutesToKickoff = Math.ceil(kickoffMs / 60000);
    const isLive =
      game.status === "live" ||
      (espn ? !espn.gameCompleted && espn.period > 0 : kickoffMs <= 0 && kickoffMs > -4 * 3600000);

    const gamePools = poolsByGame.get(game.id) ?? [];
    const openBoard =
      gamePools.find((p) => p.status === "open") ??
      (await dbGetOpenBoardCached(game, gamePools));

    let openBoardDto: ActionGameBoard | null = null;
    if (openBoard) {
      const fill = fillByPool.get(openBoard.id) ?? { remaining: 100, sold: 0, fillPercent: 0 };
      openBoardDto = buildBoard(openBoard, fill);
    }

    const totalSold = squaresSoldByGame.get(game.id) ?? 0;
    const recentPurchases = recentPurchasesByGame.get(game.id) ?? 0;
    const fillPercent = openBoardDto?.fillPercent ?? 0;
    const trendingScore = computeTrendingScore({
      recentPurchases,
      squaresSold: totalSold,
      isLive,
      minutesToKickoff,
      fillPercent,
    });

    gameCards.push({
      gameId: game.id,
      espnGameId: game.espnGameId,
      sport: game.espnSport,
      sportLabel: sportLabel(game.espnSport),
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      kickoffAt: game.kickoffAt,
      status: isLive ? "live" : game.status === "final" ? "final" : "upcoming",
      periodLabel: espn
        ? formatPeriodLabel(espn.period, game.espnSport, espn.statusDetail)
        : null,
      clockLabel: espn?.statusDetail ?? null,
      homeScore: espn?.homeScore ?? null,
      awayScore: espn?.awayScore ?? null,
      openBoard: openBoardDto,
      totalSquaresSold: totalSold,
      recentPurchases,
      trendingScore,
      hotBadge: hotBadgeFromScore(trendingScore, fillPercent),
    });
  }

  gameCards.sort((a, b) => b.trendingScore - a.trendingScore);

  const nowHappening = buildNowHappening(gameCards);
  const countdown = buildCountdown(games, gameCards);
  const fillingFast = buildFillingFast(openPools, fillByPool);
  const nextPayouts = await buildNextPayouts(games, poolRows, playerRows, winnerRows, espnById);
  const hotGames = gameCards.filter((g) => g.hotBadge).slice(0, 8);
  const purchaseFeed = buildPurchaseFeed(playerRows, poolRows);
  const upcomingSports = buildUpcomingSports(sportStats, playerRows, poolRows);
  const timeline = buildTimeline(poolRows, winnerRows, games);
  const recommendations = buildRecommendations(gameCards, fillingFast);
  const platform = buildPlatformHealth(poolRows, playerRows, winnerRows, gameCards);

  return {
    nowHappening,
    countdown,
    fillingFast,
    nextPayouts,
    hotGames,
    purchaseFeed,
    upcomingSports,
    timeline,
    recommendations,
    platform,
    updatedAt: new Date().toISOString(),
  };
}

async function dbGetOpenBoardCached(
  game: Game,
  gamePools: PoolRow[]
): Promise<PoolRow | null> {
  const cached = gamePools.find((p) => p.status === "open");
  if (cached) return cached;
  try {
    const boards = await dbListBoardsForGame(game.id);
    return boards.find((b) => b.status === "open") ?? null;
  } catch {
    return null;
  }
}

function buildNowHappening(cards: ActionGameCard[]): NowHappeningCard[] {
  const featured: NowHappeningCard[] = [];

  const live = cards.filter((c) => c.status === "live" && c.openBoard);
  for (const card of live.slice(0, 2)) {
    featured.push({
      ...card,
      featuredReason: "live",
      ctaLabel: "Play Now",
    });
  }

  const soon = cards
    .filter((c) => c.status === "upcoming" && c.openBoard)
    .sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    );

  for (const card of soon.slice(0, 2)) {
    if (featured.length >= 4) break;
    if (featured.some((f) => f.gameId === card.gameId)) continue;
    featured.push({
      ...card,
      featuredReason: "kickoff_soon",
      ctaLabel: "Play Now",
    });
  }

  const fast = cards
    .filter((c) => (c.openBoard?.fillPercent ?? 0) >= 75 && c.openBoard)
    .sort((a, b) => (b.openBoard?.fillPercent ?? 0) - (a.openBoard?.fillPercent ?? 0));

  for (const card of fast.slice(0, 1)) {
    if (featured.length >= 4) break;
    if (featured.some((f) => f.gameId === card.gameId)) continue;
    featured.push({
      ...card,
      featuredReason: "filling_fast",
      ctaLabel: "Play Now",
    });
  }

  return featured.slice(0, 4);
}

function buildCountdown(games: Game[], cards: ActionGameCard[]): CountdownGame[] {
  return games
    .map((game) => {
      const card = cards.find((c) => c.gameId === game.id);
      return {
        gameId: game.id,
        awayTeam: game.awayTeam,
        homeTeam: game.homeTeam,
        sport: game.espnSport,
        kickoffAt: game.kickoffAt,
        status: card?.status === "live" ? ("live" as const) : ("upcoming" as const),
        openBoardPoolId: card?.openBoard?.poolId ?? null,
      };
    })
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .slice(0, 12);
}

function buildFillingFast(
  openPools: PoolRow[],
  fillByPool: Map<string, FillStats>
): FillingFastBoard[] {
  return openPools
    .map((pool) => {
      const fill = fillByPool.get(pool.id) ?? { remaining: 100, sold: 0, fillPercent: 0 };
      if (fill.fillPercent < 70) return null;
      return {
        poolId: pool.id,
        gameId: pool.game_id ?? pool.id,
        awayTeam: pool.away_team,
        homeTeam: pool.home_team,
        sport: pool.espn_sport,
        boardIndex: pool.board_index ?? 1,
        fillPercent: fill.fillPercent,
        squaresRemaining: fill.remaining,
      };
    })
    .filter((item): item is FillingFastBoard => item !== null)
    .sort((a, b) => b.fillPercent - a.fillPercent)
    .slice(0, 8);
}

async function buildNextPayouts(
  games: Game[],
  poolRows: PoolRow[],
  players: PlayerRow[],
  winners: WinnerRow[],
  espnById: Map<string, EspnLiveGame>
): Promise<NextPayoutItem[]> {
  const items: NextPayoutItem[] = [];

  for (const game of games) {
    const activePools = poolRows.filter(
      (p) =>
        p.game_id === game.id &&
        (p.status === "locked" || p.status === "numbers-drawn" || p.status === "open")
    );
    const pool = activePools.sort((a, b) => (b.board_index ?? 0) - (a.board_index ?? 0))[0];
    if (!pool) continue;

    const poolWinners = winners.filter((w) => w.pool_id === pool.id);
    const completed = new Set(poolWinners.map((w) => w.quarter));
    const nextPeriod = nextPayoutPeriod(completed, game.espnSport);
    if (!nextPeriod) continue;

    const espn = espnById.get(game.espnGameId) ?? null;
    const isLive = espn ? !espn.gameCompleted : game.status === "live";
    const periodIndex = espn?.period ?? 0;
    const minutes = estimateMinutesToPayout(game.kickoffAt, isLive, periodIndex, game.espnSport);

    const prizePool = estimatePrizePool(pool, players);
    const template =
      pool.payout_template === "custom" ? "standard" : pool.payout_template ?? "standard";
    const percentages = getTemplatePercentages(template, game.espnSport);
    const periodPayouts = calcPeriodPayouts(
      prizePool,
      getEspnSportConfig(game.espnSport).scoringPeriods,
      percentages
    );
    const payoutAmount = Math.round(periodPayouts[nextPeriod] ?? prizePool * 0.2);

    items.push({
      id: `${pool.id}-${nextPeriod}`,
      periodLabel: periodDisplayLabel(nextPeriod, game.espnSport),
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      estimatedMinutes: minutes,
      estimatedLabel: formatKickoffEstimate(minutes),
      prizePool: payoutAmount > 0 ? payoutAmount : prizePool,
      poolId: pool.id,
    });
  }

  return items
    .sort((a, b) => (a.estimatedMinutes ?? 9999) - (b.estimatedMinutes ?? 9999))
    .slice(0, 6);
}

function buildPurchaseFeed(
  players: PlayerRow[],
  pools: PoolRow[]
): PurchaseFeedItem[] {
  const poolById = new Map(pools.map((p) => [p.id, p]));

  return players
    .filter((p) => p.purchase_source === "stripe")
    .slice(0, 20)
    .map((player) => {
      const pool = poolById.get(player.pool_id);
      const maskedName = maskPlayerName(player.name);
      const boardLabel = pool
        ? `${pool.away_team.split(" ").pop()} Board #${pool.board_index ?? 1}`
        : "SquareBoards";

      return {
        id: player.id,
        maskedName,
        action: "purchased" as const,
        squares: player.credits_allocated ?? 0,
        detail: boardLabel,
        at: player.created_at,
      };
    });
}

function buildUpcomingSports(
  sportStats: Awaited<ReturnType<typeof getMarketplaceSportStats>>,
  players: PlayerRow[],
  pools: PoolRow[]
): SportSummary[] {
  const summaries: SportSummary[] = sportStats.map((stat) => {
    const sportPools = pools.filter(
      (p) => p.espn_sport === stat.sport && p.status === "open"
    );
    const poolIds = new Set(sportPools.map((p) => p.id));
    const waiting = new Set(
      players
        .filter((p) => poolIds.has(p.pool_id))
        .map((p) => (p.email ?? p.name).toLowerCase())
    ).size;

    return {
      sport: stat.sport,
      label: stat.label,
      gamesToday: stat.gameCount,
      boardsOpen: stat.openBoardCount,
      playersWaiting: waiting,
      squaresRemaining: stat.squaresAvailable,
    };
  });

  summaries.push(
    {
      sport: "mlb",
      label: "MLB",
      gamesToday: 0,
      boardsOpen: 0,
      playersWaiting: 0,
      squaresRemaining: 0,
      comingSoon: true,
    },
    {
      sport: "nhl",
      label: "NHL",
      gamesToday: 0,
      boardsOpen: 0,
      playersWaiting: 0,
      squaresRemaining: 0,
      comingSoon: true,
    }
  );

  return summaries;
}

function buildTimeline(
  pools: PoolRow[],
  winners: WinnerRow[],
  games: Game[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const todayStart = new Date(startOfToday());

  for (const pool of pools) {
    if (new Date(pool.created_at) >= todayStart && pool.status === "open") {
      events.push({
        id: `open-${pool.id}`,
        time: pool.created_at,
        timeLabel: formatTimelineTime(pool.created_at),
        title: "Board Opened",
        detail: `${pool.away_team} vs ${pool.home_team} · Board #${pool.board_index ?? 1}`,
        kind: "board_open",
      });
    }
  }

  for (const game of games) {
    if (new Date(game.kickoffAt) >= todayStart) {
      events.push({
        id: `kickoff-${game.id}`,
        time: game.kickoffAt,
        timeLabel: formatTimelineTime(game.kickoffAt),
        title: "Kickoff",
        detail: `${game.awayTeam} vs ${game.homeTeam}`,
        kind: "kickoff",
      });
    }
  }

  for (const winner of winners) {
    const pool = pools.find((p) => p.id === winner.pool_id);
    const isFinal = winner.quarter === "FINAL";
    const isHalf = winner.quarter === "2H";

    events.push({
      id: `winner-${winner.id}`,
      time: winner.created_at,
      timeLabel: formatTimelineTime(winner.created_at),
      title: isFinal
        ? "Final Winner"
        : isHalf
          ? "Halftime Winner"
          : "Quarter Winner",
      detail: pool
        ? `${pool.away_team} vs ${pool.home_team} · ${maskPlayerName(winner.winning_player)}`
        : maskPlayerName(winner.winning_player),
      kind: isFinal ? "final" : isHalf ? "halftime" : "quarter_winner",
    });

    if (winner.payout_status === "paid") {
      events.push({
        id: `payout-${winner.id}`,
        time: winner.created_at,
        timeLabel: formatTimelineTime(winner.created_at),
        title: "Automatic Stripe Payout Complete",
        detail: `$${(winner.payout_amount ?? 0).toFixed(0)} → ${maskPlayerName(winner.winning_player)}`,
        kind: "payout",
      });
    }
  }

  return events
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, 20);
}

function buildRecommendations(
  cards: ActionGameCard[],
  fillingFast: FillingFastBoard[]
): SmartRecommendation[] {
  const recs: SmartRecommendation[] = [];

  const topLive = cards.find((c) => c.status === "live" && c.openBoard);
  if (topLive?.openBoard) {
    recs.push({
      id: `rec-live-${topLive.gameId}`,
      reason: "Live right now",
      title: `${topLive.awayTeam} vs ${topLive.homeTeam}`,
      detail: `${topLive.openBoard.squaresRemaining} squares left on Board #${topLive.openBoard.boardIndex}`,
      playUrl: `/pool/${topLive.openBoard.poolId}`,
      ctaLabel: "Play Now",
    });
  }

  const urgent = fillingFast[0];
  if (urgent) {
    recs.push({
      id: `rec-urgent-${urgent.poolId}`,
      reason: "Board filling fast",
      title: `${urgent.awayTeam} vs ${urgent.homeTeam}`,
      detail: `Only ${urgent.squaresRemaining} squares remain · ${urgent.fillPercent}% full`,
      playUrl: `/pool/${urgent.poolId}`,
      ctaLabel: "Play Now",
    });
  }

  const soon = cards
    .filter((c) => c.status === "upcoming" && c.openBoard)
    .sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    )[0];

  if (soon?.openBoard) {
    recs.push({
      id: `rec-soon-${soon.gameId}`,
      reason: "Kickoff approaching",
      title: `${soon.awayTeam} vs ${soon.homeTeam}`,
      detail: `Board #${soon.openBoard.boardIndex} is open before kickoff`,
      playUrl: `/pool/${soon.openBoard.poolId}`,
      ctaLabel: "Play Now",
    });
  }

  return recs.slice(0, 4);
}

function buildPlatformHealth(
  pools: PoolRow[],
  players: PlayerRow[],
  winners: WinnerRow[],
  cards: ActionGameCard[]
): ActionPlatformHealth {
  const todayStart = startOfToday();
  const recentSince = hoursAgo(3);

  const playersOnline = new Set(
    players
      .filter((p) => new Date(p.created_at) >= new Date(recentSince))
      .map((p) => (p.email ?? p.name).toLowerCase())
  ).size;

  const boardsRunning = pools.filter((p) =>
    ACTIVE_STATUSES.includes(p.status as (typeof ACTIVE_STATUSES)[number])
  ).length;

  const squaresSoldToday = players
    .filter((p) => new Date(p.created_at) >= new Date(todayStart))
    .reduce((sum, p) => sum + (p.credits_allocated ?? 0), 0);

  const todaysWinners = winners.filter(
    (w) => new Date(w.created_at) >= new Date(todayStart)
  );
  const automaticPayoutsToday = todaysWinners.filter(
    (w) => w.payout_status === "paid"
  ).length;
  const moneyAwardedToday = todaysWinners.reduce(
    (sum, w) => sum + (w.payout_amount ?? 0),
    0
  );

  let moneyInPlay = 0;
  for (const pool of pools.filter((p) => ACTIVE_STATUSES.includes(p.status as never))) {
    moneyInPlay += estimatePrizePool(pool, players);
  }

  return {
    playersOnline,
    gamesLive: cards.filter((c) => c.status === "live").length,
    boardsRunning,
    automaticPayoutsToday,
    squaresSoldToday,
    moneyAwardedToday: Math.round(moneyAwardedToday),
    moneyInPlay: Math.round(moneyInPlay),
  };
}
