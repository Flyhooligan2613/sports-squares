import type { PlayerNotification } from "@/lib/player/dashboardTypes";
import type { EspnLiveGame, Pool, PoolStatus } from "@/lib/types";
import type { PlayerRow, SquareRow, WinnerRow } from "@/lib/database/types";

const ACTIVE_STATUSES: PoolStatus[] = ["open", "locked", "numbers-drawn"];

function periodLabel(period: string): string {
  if (period === "FINAL") return "Final";
  if (period === "1H") return "Half 1";
  if (period === "2H") return "Half 2";
  if (period === "INN3") return "Inning 3";
  if (period === "INN5") return "Inning 5";
  if (period === "INN7") return "Inning 7";
  return `Quarter ${period.slice(1)}`;
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

export interface NotificationBuildInput {
  pools: Pool[];
  players: PlayerRow[];
  squareRows: SquareRow[];
  winnerRows: WinnerRow[];
  espnByPool: Map<string, EspnLiveGame | null>;
  playerIds: Set<string>;
  playerNames: Set<string>;
}

export function buildPlayerNotifications(
  input: NotificationBuildInput
): PlayerNotification[] {
  const notifications: PlayerNotification[] = [];

  for (const pool of input.pools) {
    const ownedSquares = input.squareRows
      .filter(
        (s) =>
          s.pool_id === pool.id &&
          s.player_id &&
          input.playerIds.has(s.player_id)
      )
      .map((s) => s.square_number);
    const ownedSet = new Set(ownedSquares);
    if (ownedSet.size === 0) continue;

    const boardIndex = pool.boardIndex ?? 1;
    const poolWinners = input.winnerRows.filter((w) => w.pool_id === pool.id);
    const unclaimed = pool.squares.filter((s) => !s.claimed).length;
    const fillPercent = Math.round(((100 - unclaimed) / 100) * 100);

    for (const winner of poolWinners) {
      if (!playerOwnsWin(winner, input.playerNames, ownedSet)) continue;

      notifications.push({
        id: `win-${winner.id}`,
        type: "quarter_winner",
        title: "🏆 You won!",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · ${periodLabel(winner.quarter)} · $${(winner.payout_amount ?? 0).toFixed(0)}`,
        at: winner.created_at,
      });

      if (winner.payout_status === "paid") {
        notifications.push({
          id: `pay-${winner.id}`,
          type: "payment_sent",
          title: "💰 Automatic payout sent",
          detail: `$${(winner.payout_amount ?? 0).toFixed(0)} for ${periodLabel(winner.quarter)}`,
          at: winner.created_at,
        });
      } else if (winner.payout_status === "pending") {
        notifications.push({
          id: `pending-${winner.id}`,
          type: "payment_sent",
          title: "💰 Payout processing",
          detail: `$${(winner.payout_amount ?? 0).toFixed(0)} for ${periodLabel(winner.quarter)}`,
          at: winner.created_at,
        });
      }
    }

    if (pool.status === "open" && unclaimed > 0 && unclaimed <= 10) {
      notifications.push({
        id: `almost-${pool.id}`,
        type: "board_filled",
        title: "🔥 Board almost full",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · Only ${unclaimed} squares left`,
        at: new Date().toISOString(),
      });
    }

    if (pool.status === "locked" && ownedSet.size > 0) {
      notifications.push({
        id: `filled-${pool.id}`,
        type: "board_filled",
        title: "📋 Board filled",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · Board #${boardIndex}`,
        at: pool.kickoffAt ?? new Date().toISOString(),
      });
    }

    if (pool.status === "numbers-drawn" && ownedSet.size > 0) {
      notifications.push({
        id: `numbers-${pool.id}`,
        type: "numbers_assigned",
        title: "🎯 Numbers assigned",
        detail: `Your squares are locked in on Board #${boardIndex}`,
        at: pool.kickoffAt ?? new Date().toISOString(),
      });
    }

    if (isKickoffSoon(pool.kickoffAt)) {
      const minutes = Math.max(
        1,
        Math.round(
          (new Date(pool.kickoffAt!).getTime() - Date.now()) / 60_000
        )
      );
      notifications.push({
        id: `soon-${pool.id}`,
        type: "game_starting",
        title: "🏈 Game begins soon",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} in ~${minutes} minutes`,
        at: pool.kickoffAt!,
      });
    }

    const espnGame = input.espnByPool.get(pool.id);
    if (
      espnGame &&
      !espnGame.gameCompleted &&
      ACTIVE_STATUSES.includes(pool.status) &&
      fillPercent >= 50
    ) {
      notifications.push({
        id: `live-${pool.id}`,
        type: "game_starting",
        title: "📺 Your game is live",
        detail: `${pool.awayTeam} vs ${pool.homeTeam} · Board #${boardIndex}`,
        at: new Date().toISOString(),
      });
    }
  }

  notifications.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return notifications;
}

export function countUnreadNotifications(
  notifications: PlayerNotification[],
  readIds: string[]
): number {
  const read = new Set(readIds);
  return notifications.filter((item) => !read.has(item.id)).length;
}
