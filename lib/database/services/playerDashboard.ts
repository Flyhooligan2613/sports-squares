import { fetchEspnGame } from "@/lib/espn";
import { getActivePeriodFromGame } from "@/lib/espn/sync";
import { getScoringPeriods } from "@/lib/espn/sports";
import { assemblePool } from "@/lib/database/mappers";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "@/lib/database/types";
import {
  calcPeriodPayouts,
  calcPoolSummary,
} from "@/lib/poolFinance";
import { resolvePoolPayoutPercentages } from "@/lib/payoutTemplates";
import type {
  PlayerDashboardData,
  PlayerNotification,
  PlayerRecentWin,
} from "@/lib/player/dashboardTypes";
import { getPlayerConnectStatus } from "@/lib/database/services/stripeConnect";
import { isStripeConnectEnabled } from "@/lib/stripe/connect";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import type { EspnLiveGame, Pool, PoolStatus, ScoringPeriod } from "@/lib/types";

const ACTIVE_STATUSES: PoolStatus[] = ["open", "locked", "numbers-drawn"];
const TERMINAL_STATUSES: PoolStatus[] = ["completed", "archived"];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Player";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function periodLabel(period: ScoringPeriod): string {
  if (period === "FINAL") return "Final";
  if (period === "1H") return "Half 1";
  if (period === "2H") return "Half 2";
  return `Quarter ${period.slice(1)}`;
}

function isKickoffPast(kickoffAt?: string | null): boolean {
  if (!kickoffAt) return false;
  return new Date(kickoffAt).getTime() <= Date.now();
}

function isKickoffSoon(kickoffAt?: string | null): boolean {
  if (!kickoffAt) return false;
  const diff = new Date(kickoffAt).getTime() - Date.now();
  return diff > 0 && diff <= 2 * 60 * 60 * 1000;
}

function playerOwnsWin(
  winner: WinnerRow,
  playerNames: Set<string>,
  ownedSquares: Set<number>
): boolean {
  if (ownedSquares.has(winner.winning_square)) return true;
  return playerNames.has(winner.winning_player.trim().toLowerCase());
}

async function loadEspnGame(
  espnGameId: string | null | undefined,
  espnSport: Pool["espnSport"]
): Promise<EspnLiveGame | null> {
  if (!espnGameId) return null;
  try {
    return await fetchEspnGame(espnGameId, espnSport);
  } catch {
    return null;
  }
}

function classifyPool(
  pool: Pool,
  espnGame: EspnLiveGame | null
): "live" | "upcoming" | "done" {
  if (TERMINAL_STATUSES.includes(pool.status)) return "done";

  const liveFromEspn = espnGame && !espnGame.gameCompleted;
  const kickoffPast = isKickoffPast(pool.kickoffAt);

  if (liveFromEspn || (kickoffPast && ACTIVE_STATUSES.includes(pool.status))) {
    return "live";
  }

  if (
    ACTIVE_STATUSES.includes(pool.status) &&
    pool.kickoffAt &&
    !kickoffPast
  ) {
    return "upcoming";
  }

  if (espnGame?.gameCompleted) return "done";
  return "done";
}

export async function getPlayerDashboard(
  email: string
): Promise<PlayerDashboardData | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: playerRows, error: playersError } = await supabase
    .from(TABLES.players)
    .select("*")
    .ilike("email", normalized);

  if (playersError) throw playersError;
  if (!playerRows?.length) {
    const connectStatus = await getPlayerConnectStatus(normalized);
    const identity = await getPlayerPublicIdentity(normalized);
    return {
      displayName: identity.publicLabel,
      username: identity.username,
      publicLabel: identity.publicLabel,
      profileBio: identity.profileBio,
      avatarEmoji: identity.avatarEmoji,
      usernameCustomized: identity.usernameCustomized,
      needsUsernameSetup: !identity.usernameCustomized,
      email: normalized,
      stats: {
        totalWinnings: 0,
        lifetimeWins: 0,
        activeBoards: 0,
        upcomingGames: 0,
      },
      connectStatus,
      connectEnabled: isStripeConnectEnabled(),
      activeGames: [],
      upcomingGames: [],
      recentWins: [],
      notifications: [],
    };
  }

  const players = playerRows as PlayerRow[];
  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const playerIds = new Set(players.map((p) => p.id));
  const playerNames = new Set(
    players.map((p) => p.name.trim().toLowerCase())
  );
  const displayName =
    players.find((p) => p.name.trim())?.name.split(" ")[0] ??
    displayNameFromEmail(normalized);

  const identity = await getPlayerPublicIdentity(normalized);

  const [poolsRes, squaresRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").in("id", poolIds),
    supabase.from(TABLES.squares).select("*").in("pool_id", poolIds),
    supabase.from(TABLES.winners).select("*").in("pool_id", poolIds),
  ]);

  if (poolsRes.error) throw poolsRes.error;
  if (squaresRes.error) throw squaresRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const poolRows = (poolsRes.data ?? []) as PoolRow[];
  const squareRows = (squaresRes.data ?? []) as SquareRow[];
  const winnerRows = (winnersRes.data ?? []) as WinnerRow[];

  const pools = poolRows.map((row) =>
    assemblePool(
      row,
      players.filter((p) => p.pool_id === row.id),
      squareRows.filter((s) => s.pool_id === row.id)
    )
  );

  const espnByPool = new Map<string, EspnLiveGame | null>();
  await Promise.all(
    pools.map(async (pool) => {
      const game = await loadEspnGame(pool.espnGameId, pool.espnSport);
      espnByPool.set(pool.id, game);
    })
  );

  const activeGames: PlayerDashboardData["activeGames"] = [];
  const upcomingGames: PlayerDashboardData["upcomingGames"] = [];
  const notifications: PlayerNotification[] = [];
  const recentWins: PlayerRecentWin[] = [];

  let totalWinnings = 0;
  let lifetimeWins = 0;

  for (const pool of pools) {
    const poolPlayers = players.filter((p) => p.pool_id === pool.id);
    const inviteToken =
      poolPlayers.find((p) => p.invite_token)?.invite_token ?? null;
    const ownedSquares = squareRows
      .filter(
        (s) => s.pool_id === pool.id && s.player_id && playerIds.has(s.player_id)
      )
      .map((s) => s.square_number)
      .sort((a, b) => a - b);
    const ownedSet = new Set(ownedSquares);
    const espnGame = espnByPool.get(pool.id) ?? null;
    const bucket = classifyPool(pool, espnGame);
    const boardIndex = pool.boardIndex ?? 1;

    const poolWinners = winnerRows.filter((w) => w.pool_id === pool.id);
    for (const winner of poolWinners) {
      if (!playerOwnsWin(winner, playerNames, ownedSet)) continue;

      lifetimeWins += 1;
      if (winner.payout_status === "paid" && winner.payout_amount) {
        totalWinnings += winner.payout_amount;
      }

      recentWins.push({
        id: winner.id,
        homeTeam: pool.homeTeam,
        awayTeam: pool.awayTeam,
        periodLabel: periodLabel(winner.quarter),
        amount: winner.payout_amount ?? 0,
        payoutStatus: winner.payout_status,
        wonAt: winner.created_at,
      });

      notifications.push({
        id: `win-${winner.id}`,
        type: "quarter_winner",
        title: "Quarter Winner",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · Square ${winner.winning_square}`,
        at: winner.created_at,
      });

      if (winner.payout_status === "paid") {
        notifications.push({
          id: `pay-${winner.id}`,
          type: "payment_sent",
          title: "Payment Sent",
          detail: `$${(winner.payout_amount ?? 0).toFixed(0)} deposited for ${periodLabel(winner.quarter)}`,
          at: winner.created_at,
        });
      }
    }

    if (pool.status === "locked" && ownedSquares.length > 0) {
      notifications.push({
        id: `filled-${pool.id}`,
        type: "board_filled",
        title: "Board Filled",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · Board #${boardIndex}`,
        at: pool.kickoffAt ?? new Date().toISOString(),
      });
    }

    if (pool.status === "numbers-drawn" && ownedSquares.length > 0) {
      notifications.push({
        id: `numbers-${pool.id}`,
        type: "numbers_assigned",
        title: "Numbers Assigned",
        detail: `Your squares are locked in on Board #${boardIndex}`,
        at: pool.kickoffAt ?? new Date().toISOString(),
      });
    }

    if (isKickoffSoon(pool.kickoffAt) && ownedSquares.length > 0) {
      notifications.push({
        id: `soon-${pool.id}`,
        type: "game_starting",
        title: "Game Starting Soon",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} kicks off shortly`,
        at: pool.kickoffAt!,
      });
    }

    if (bucket === "live") {
      const summary = calcPoolSummary(pool);
      const periods = getScoringPeriods(pool.espnSport);
      const payouts = calcPeriodPayouts(
        summary.prizePool,
        periods,
        resolvePoolPayoutPercentages(pool)
      );
      const currentPeriod = espnGame
        ? getActivePeriodFromGame(espnGame, pool.espnSport)
        : null;
      const currentWinner = currentPeriod
        ? poolWinners.find((w) => w.quarter === currentPeriod)
        : null;

      activeGames.push({
        poolId: pool.id,
        inviteToken,
        homeTeam: pool.homeTeam,
        awayTeam: pool.awayTeam,
        boardIndex,
        isLive: Boolean(espnGame && !espnGame.gameCompleted),
        kickoffLabel: espnGame?.statusDetail ?? "In progress",
        homeScore: espnGame?.homeScore ?? null,
        awayScore: espnGame?.awayScore ?? null,
        ownedSquares,
        currentQuarterWinner: currentWinner
          ? `Square ${currentWinner.winning_square}`
          : null,
        currentPeriod,
        potentialPrize: currentPeriod ? (payouts[currentPeriod] ?? null) : null,
      });
    } else if (bucket === "upcoming" && ownedSquares.length > 0 && pool.kickoffAt) {
      upcomingGames.push({
        poolId: pool.id,
        inviteToken,
        homeTeam: pool.homeTeam,
        awayTeam: pool.awayTeam,
        boardIndex,
        kickoffAt: pool.kickoffAt,
        ownedSquareCount: ownedSquares.length,
      });
    }
  }

  recentWins.sort(
    (a, b) => new Date(b.wonAt).getTime() - new Date(a.wonAt).getTime()
  );

  notifications.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  activeGames.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return a.boardIndex - b.boardIndex;
  });

  upcomingGames.sort(
    (a, b) =>
      new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
  );

  const connectStatus = await getPlayerConnectStatus(normalized);

  return {
    displayName: identity.publicLabel,
    username: identity.username,
    publicLabel: identity.publicLabel,
    profileBio: identity.profileBio,
    avatarEmoji: identity.avatarEmoji,
    usernameCustomized: identity.usernameCustomized,
    needsUsernameSetup: !identity.usernameCustomized,
    email: normalized,
    stats: {
      totalWinnings: Math.round(totalWinnings),
      lifetimeWins,
      activeBoards: activeGames.length,
      upcomingGames: upcomingGames.length,
    },
    connectStatus,
    connectEnabled: isStripeConnectEnabled(),
    activeGames,
    upcomingGames,
    recentWins: recentWins.slice(0, 8),
    notifications: notifications.slice(0, 6),
  };
}
