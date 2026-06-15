import { getActionCenterData } from "@/lib/database/services/actionCenter";
import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";
import { TABLES } from "@/lib/database/config";
import { assemblePool } from "@/lib/database/mappers";
import { calcPoolSummary } from "@/lib/poolFinance";
import { resolvePoolHostingFeePercent } from "@/lib/platform/core/platformFeeSchedule";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "@/lib/database/types";
import type {
  LiveTvBigWinner,
  LiveTvBoardData,
  LiveTvBoardEvent,
  LiveTvData,
  LiveTvHeroCard,
  LiveTvKickoff,
  LiveTvMoneyStats,
  LiveTvPayoutItem,
  LiveTvScoreboardGame,
  LiveTvSportMap,
  LiveTvStreamEvent,
  LiveTvTrendingGame,
  LiveTvWinnerAnnouncement,
  TrendBadge,
} from "@/lib/liveTv/types";
import type { EspnSport } from "@/lib/types";

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sportLabel(sport: EspnSport): string {
  const labels: Record<string, string> = {
    nfl: "NFL",
    ncaaf: "NCAAF",
    nba: "NBA",
    ncaab: "NCAAB",
  };
  return labels[sport] ?? sport.toUpperCase();
}

function estimatePrizePool(pool: PoolRow, players: PlayerRow[]): number {
  const credits = players
    .filter((p) => p.pool_id === pool.id)
    .reduce((sum, p) => sum + (p.credits_allocated ?? 0), 0);
  const revenue = credits * (pool.cost_per_square ?? 0);
  const fee = revenue * (resolvePoolHostingFeePercent({
    entryTierCents: pool.entry_tier_cents,
    costPerSquare: pool.cost_per_square,
  }) / 100);
  return Math.round(revenue - fee);
}

function trendBadge(score: number, fillPercent: number, recent: number): TrendBadge {
  if (fillPercent >= 85) return "fast_filling";
  if (recent >= 5) return "most_played";
  return "hot";
}

async function loadFeaturedBoard(
  poolId: string,
  recentPlayerIds: Set<string>
): Promise<LiveTvBoardData | null> {
  const supabase = getSupabaseAdmin();

  const [poolRes, playersRes, squaresRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").eq("id", poolId).maybeSingle(),
    supabase.from(TABLES.players).select("*").eq("pool_id", poolId),
    supabase
      .from(TABLES.squares)
      .select("*")
      .eq("pool_id", poolId)
      .order("square_number"),
    supabase.from(TABLES.winners).select("*").eq("pool_id", poolId),
  ]);

  if (poolRes.error || !poolRes.data) return null;
  if (playersRes.error || squaresRes.error || winnersRes.error) return null;

  const poolRow = poolRes.data as PoolRow;
  const pool = assemblePool(
    poolRow,
    (playersRes.data ?? []) as PlayerRow[],
    (squaresRes.data ?? []) as SquareRow[]
  );

  const winners = (winnersRes.data ?? []) as WinnerRow[];
  const featuredWinner = winners.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  const claimed = pool.squares.filter((s) => s.claimed).length;
  const fillPercent = Math.round((claimed / 100) * 100);

  return {
    poolId,
    awayTeam: pool.awayTeam,
    homeTeam: pool.homeTeam,
    boardIndex: pool.boardIndex ?? 1,
    topNumbers: pool.topNumbers?.length === 10 ? pool.topNumbers : null,
    sideNumbers: pool.sideNumbers?.length === 10 ? pool.sideNumbers : null,
    squares: pool.squares.map((square) => {
      const owner = square.owner;
      return {
        id: square.id,
        claimed: square.claimed,
        color: owner?.color ?? null,
        initials: owner?.initials ?? null,
        recentlyPurchased: owner?.id ? recentPlayerIds.has(owner.id) : false,
      };
    }),
    featuredWinningSquareId: featuredWinner?.winning_square ?? null,
    pastWinningSquareIds: winners
      .filter((w) => w.id !== featuredWinner?.id)
      .map((w) => w.winning_square),
    fillPercent,
    prizePool: Math.round(calcPoolSummary(pool).prizePool),
    status: pool.status,
  };
}

function buildHeroCards(
  action: Awaited<ReturnType<typeof getActionCenterData>>,
  winners: Awaited<ReturnType<typeof getLiveWinnersCenterData>>
): LiveTvHeroCard[] {
  const cards: LiveTvHeroCard[] = [];

  for (const game of action.nowHappening.filter((g) => g.status === "live").slice(0, 2)) {
    cards.push({
      id: `hero-live-${game.gameId}`,
      kind: "live",
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      sport: game.sport,
      sportLabel: game.sportLabel,
      periodLabel: game.periodLabel ?? undefined,
      clockLabel: game.clockLabel ?? undefined,
      boardIndex: game.openBoard?.boardIndex,
      prizePool: undefined,
      squaresRemaining: game.openBoard?.squaresRemaining,
      poolId: game.openBoard?.poolId,
    });
  }

  for (const game of action.nowHappening
    .filter((g) => g.featuredReason === "kickoff_soon")
    .slice(0, 1)) {
    cards.push({
      id: `hero-soon-${game.gameId}`,
      kind: "starting_soon",
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      sport: game.sport,
      sportLabel: game.sportLabel,
      kickoffAt: game.kickoffAt,
      boardIndex: game.openBoard?.boardIndex,
      squaresRemaining: game.openBoard?.squaresRemaining,
      poolId: game.openBoard?.poolId,
    });
  }

  const recentWinner = winners.winners[0];
  if (recentWinner) {
    cards.push({
      id: `hero-paid-${recentWinner.id}`,
      kind: "just_paid",
      awayTeam: recentWinner.awayTeam,
      homeTeam: recentWinner.homeTeam,
      sport: recentWinner.sportKey ?? "nfl",
      sportLabel: recentWinner.sport,
      periodWon: recentWinner.periodLabel,
      winnerName: recentWinner.maskedWinner,
      winAmount: recentWinner.amount,
      boardIndex: recentWinner.boardIndex,
      poolId: undefined,
    });
  }

  if (winners.bigWin) {
    cards.push({
      id: `hero-big-${winners.bigWin.id}`,
      kind: "just_paid",
      awayTeam: winners.bigWin.awayTeam,
      homeTeam: winners.bigWin.homeTeam,
      sport: "nfl",
      sportLabel: "Big Win",
      periodWon: "Largest Today",
      winnerName: winners.bigWin.maskedWinner,
      winAmount: winners.bigWin.amount,
      boardIndex: winners.bigWin.boardIndex,
    });
  }

  return cards.slice(0, 6);
}

function buildScoreboard(
  action: Awaited<ReturnType<typeof getActionCenterData>>,
  poolRows: PoolRow[],
  players: PlayerRow[]
): LiveTvScoreboardGame[] {
  const seen = new Set<string>();

  return [...action.hotGames, ...action.nowHappening]
    .filter((g) => {
      if (seen.has(g.gameId)) return false;
      seen.add(g.gameId);
      return true;
    })
    .slice(0, 8)
    .map((game) => {
      const pool = game.openBoard
        ? poolRows.find((p) => p.id === game.openBoard?.poolId)
        : undefined;
      const prizePool = pool ? estimatePrizePool(pool, players) : 0;

      return {
        gameId: game.gameId,
        poolId: game.openBoard?.poolId ?? null,
        sport: game.sport,
        sportLabel: game.sportLabel,
        awayTeam: game.awayTeam,
        homeTeam: game.homeTeam,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        periodLabel: game.periodLabel,
        clockLabel: game.clockLabel,
        possession: null,
        boardIndex: game.openBoard?.boardIndex ?? null,
        prizePool,
        squaresRemaining: game.openBoard?.squaresRemaining ?? 0,
        status: game.status === "live" ? "live" : game.status === "final" ? "final" : "upcoming",
      };
    });
}

function buildStreamEvents(
  action: Awaited<ReturnType<typeof getActionCenterData>>,
  winners: Awaited<ReturnType<typeof getLiveWinnersCenterData>>
): LiveTvStreamEvent[] {
  const events: LiveTvStreamEvent[] = [];

  for (const purchase of action.purchaseFeed.slice(0, 12)) {
    events.push({
      id: purchase.id,
      type: "purchase",
      title: `${purchase.maskedName} purchased ${purchase.squares} squares`,
      detail: purchase.detail,
      at: purchase.at,
      accent: "purple",
    });
  }

  for (const board of action.fillingFast.filter((b) => b.fillPercent >= 90).slice(0, 4)) {
    events.push({
      id: `fill-${board.poolId}`,
      type: "fill_milestone",
      title: `Board #${board.boardIndex} reached ${board.fillPercent}%`,
      detail: `${board.awayTeam} vs ${board.homeTeam}`,
      at: new Date().toISOString(),
      accent: "gold",
    });
  }

  for (const item of winners.activity.slice(0, 16)) {
    const typeMap: Record<string, LiveTvStreamEvent["type"]> = {
      board_filled: "sold_out",
      board_created: "board_created",
      numbers_assigned: "numbers_assigned",
      kickoff_started: "kickoff",
      quarter_winner: "winner",
      final_winner: "winner",
      payout_sent: "payout",
      squares_purchased: "purchase",
      game_opened: "board_created",
    };

    events.push({
      id: item.id,
      type: typeMap[item.type] ?? "purchase",
      title: item.title,
      detail: item.detail,
      at: item.at,
      accent: item.accent,
    });
  }

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 24);
}

function buildBoardEvents(pools: PoolRow[]): LiveTvBoardEvent[] {
  const events: LiveTvBoardEvent[] = [];
  const todayStart = new Date(startOfToday());

  const byGame = new Map<string, PoolRow[]>();
  for (const pool of pools) {
    if (!pool.game_id || !pool.auto_created) continue;
    const list = byGame.get(pool.game_id) ?? [];
    list.push(pool);
    byGame.set(pool.game_id, list);
  }

  for (const boards of Array.from(byGame.values())) {
    const sorted = boards.sort((a, b) => (a.board_index ?? 0) - (b.board_index ?? 0));
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.status !== "open" && next.status === "open") {
        if (new Date(next.created_at) >= todayStart) {
          events.push({
            id: `board-event-${next.id}`,
            awayTeam: next.away_team,
            homeTeam: next.home_team,
            soldOutBoardIndex: current.board_index ?? 1,
            newBoardIndex: next.board_index ?? 2,
            at: next.created_at,
          });
        }
      }
    }
  }

  return events.slice(0, 6);
}

function emptyData(): LiveTvData {
  return {
    heroCards: [],
    scoreboard: [],
    featuredBoard: null,
    money: {
      prizeMoneyPaidToday: 0,
      squaresSoldValueToday: 0,
      currentPrizePools: 0,
      automaticPayoutsToday: 0,
    },
    streamEvents: [],
    trending: [],
    kickoffs: [],
    sportMap: [],
    payouts: [],
    bigWinner: null,
    boardEvents: [],
    sidebarFeed: [],
    latestWinner: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveTvData(): Promise<LiveTvData> {
  if (!isSupabaseAdminConfigured()) return emptyData();

  const [action, winners] = await Promise.all([
    getActionCenterData(),
    getLiveWinnersCenterData(),
  ]);

  const supabase = getSupabaseAdmin();
  const { data: poolData } = await supabase
    .from(TABLES.pools)
    .select("*")
    .eq("marketplace_visible", true)
    .order("created_at", { ascending: false })
    .limit(120);

  const { data: playerData } = await supabase
    .from(TABLES.players)
    .select("*")
    .gte("created_at", startOfToday())
    .limit(200);

  const poolRows = (poolData ?? []) as PoolRow[];
  const players = (playerData ?? []) as PlayerRow[];

  const recentPlayerIds = new Set(
    players
      .filter((p) => Date.now() - new Date(p.created_at).getTime() < 30 * 60 * 1000)
      .map((p) => p.id)
  );

  const featuredPoolId =
    action.fillingFast[0]?.poolId ??
    action.nowHappening.find((g) => g.openBoard)?.openBoard?.poolId ??
    action.hotGames.find((g) => g.openBoard)?.openBoard?.poolId ??
    null;

  const featuredBoard = featuredPoolId
    ? await loadFeaturedBoard(featuredPoolId, recentPlayerIds)
    : null;

  let currentPrizePools = 0;
  for (const pool of poolRows.filter((p) => p.status === "open" || p.status === "locked")) {
    currentPrizePools += estimatePrizePool(pool, players);
  }

  const squaresSoldValueToday = players.reduce(
    (sum, p) => sum + (p.amount_paid ?? p.credits_allocated * 10),
    0
  );

  const heroCards = buildHeroCards(action, winners);
  const scoreboard = buildScoreboard(action, poolRows, players);
  const streamEvents = buildStreamEvents(action, winners);

  const trending: LiveTvTrendingGame[] = action.hotGames.slice(0, 6).map((g) => ({
    gameId: g.gameId,
    poolId: g.openBoard?.poolId ?? null,
    awayTeam: g.awayTeam,
    homeTeam: g.homeTeam,
    sport: g.sport,
    badge: trendBadge(g.trendingScore, g.openBoard?.fillPercent ?? 0, g.recentPurchases),
    trendingScore: g.trendingScore,
    fillPercent: g.openBoard?.fillPercent ?? 0,
    recentPurchases: g.recentPurchases,
  }));

  const kickoffs: LiveTvKickoff[] = action.countdown.slice(0, 10).map((g) => ({
    gameId: g.gameId,
    poolId: g.openBoardPoolId,
    awayTeam: g.awayTeam,
    homeTeam: g.homeTeam,
    sport: g.sport,
    kickoffAt: g.kickoffAt,
    status: g.status,
  }));

  const sportMap: LiveTvSportMap[] = action.upcomingSports.map((s) => ({
    sport: s.sport,
    label: s.label,
    games: s.gamesToday,
    boards: s.boardsOpen,
    players: s.playersWaiting,
    prizePools: 0,
    comingSoon: s.comingSoon,
  }));

  const payouts: LiveTvPayoutItem[] = winners.ticker.slice(0, 12).map((t) => {
    const winner = winners.winners.find((w) => w.id === t.id);
    return {
      id: t.id,
      periodLabel: winner?.periodLabel ?? "Winner",
      amount: t.amount,
      awayTeam: winner?.awayTeam ?? "Game",
      homeTeam: winner?.homeTeam ?? "Board",
      paidAt: winner?.wonAt ?? new Date().toISOString(),
    };
  });

  const bigWinner: LiveTvBigWinner | null = winners.bigWin
    ? {
        id: winners.bigWin.id,
        maskedName: winners.bigWin.maskedWinner,
        amount: winners.bigWin.amount,
        awayTeam: winners.bigWin.awayTeam,
        homeTeam: winners.bigWin.homeTeam,
        boardIndex: winners.bigWin.boardIndex,
        paidAt: winners.bigWin.paidAt,
      }
    : null;

  const latestWinnerRow = winners.winners[0];
  const latestWinner: LiveTvWinnerAnnouncement | null = latestWinnerRow
    ? {
        id: latestWinnerRow.id,
        awayTeam: latestWinnerRow.awayTeam,
        homeTeam: latestWinnerRow.homeTeam,
        periodLabel: latestWinnerRow.periodLabel,
        maskedName: latestWinnerRow.maskedWinner,
        amount: latestWinnerRow.amount,
        paidAutomatically: latestWinnerRow.payoutStatus === "paid",
        at: latestWinnerRow.wonAt,
      }
    : null;

  const boardEvents = buildBoardEvents(poolRows);

  const sidebarFeed: LiveTvStreamEvent[] = winners.activity.slice(0, 20).map((item) => ({
    id: item.id,
    type:
      item.type === "kickoff_started"
        ? "kickoff"
        : item.type === "payout_sent" || item.type === "final_winner"
          ? "payout"
          : item.type === "quarter_winner"
            ? "winner"
            : item.type === "board_filled"
              ? "sold_out"
              : item.type === "board_created"
                ? "board_created"
                : item.type === "numbers_assigned"
                  ? "numbers_assigned"
                  : "purchase",
    title: item.title,
    detail: item.detail,
    at: item.at,
    accent: item.accent,
  }));

  return {
    heroCards,
    scoreboard,
    featuredBoard,
    money: {
      prizeMoneyPaidToday: winners.platform.prizeMoneyPaidToday,
      squaresSoldValueToday: Math.round(squaresSoldValueToday),
      currentPrizePools: Math.round(currentPrizePools),
      automaticPayoutsToday: winners.platform.automaticPayoutsToday,
    },
    streamEvents,
    trending,
    kickoffs,
    sportMap,
    payouts,
    bigWinner,
    boardEvents,
    sidebarFeed,
    latestWinner,
    updatedAt: new Date().toISOString(),
  };
}
