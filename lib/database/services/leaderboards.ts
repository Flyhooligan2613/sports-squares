import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, SquareRow, WinnerRow } from "@/lib/database/types";
import type {
  LeaderboardBoard,
  LeaderboardEntry,
  LeaderboardTab,
  LeaderboardsData,
} from "@/lib/player/leaderboardTypes";
import {
  LEADERBOARD_LIMIT,
  calcWinStreaks,
  displayNameFromEmail,
  maskPlayerLabel,
  normalizeEmail,
  playerOwnsWin,
} from "@/lib/player/statsCore";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface EmailAggregate {
  email: string;
  displayName: string;
  lifetimeWins: number;
  lifetimeWinnings: number;
  weeklyWins: number;
  winDates: Date[];
  boardsPlayed: Set<string>;
}

interface PoolEmailContext {
  displayName: string;
  names: Set<string>;
  squares: Set<number>;
}

function buildBoard(
  id: LeaderboardTab,
  title: string,
  subtitle: string,
  sorted: Array<{ email: string; displayName: string; value: number; valueLabel: string }>,
  viewerEmail: string | null | undefined
): LeaderboardBoard {
  const entries: LeaderboardEntry[] = sorted.slice(0, LEADERBOARD_LIMIT).map(
    (row, index) => ({
      rank: index + 1,
      displayName: maskPlayerLabel(row.displayName),
      value: row.value,
      valueLabel: row.valueLabel,
      isViewer: Boolean(viewerEmail && row.email === viewerEmail),
    })
  );

  let viewerRank: number | null = null;
  if (viewerEmail) {
    const idx = sorted.findIndex((row) => row.email === viewerEmail);
    viewerRank = idx >= 0 ? idx + 1 : null;
  }

  return { id, title, subtitle, entries, viewerRank };
}

export async function getLeaderboards(
  viewerEmail?: string | null
): Promise<LeaderboardsData | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const normalizedViewer = viewerEmail?.trim()
    ? normalizeEmail(viewerEmail)
    : null;

  const supabase = getSupabaseAdmin();
  const weekAgo = Date.now() - WEEK_MS;

  const [playersRes, winnersRes] = await Promise.all([
    supabase.from(TABLES.players).select("*").not("email", "is", null),
    supabase.from(TABLES.winners).select("*"),
  ]);

  if (playersRes.error) throw playersRes.error;
  if (winnersRes.error) throw winnersRes.error;

  const players = (playersRes.data ?? []) as PlayerRow[];
  const winners = (winnersRes.data ?? []) as WinnerRow[];

  if (!players.length) {
    return {
      updatedAt: new Date().toISOString(),
      totalPlayers: 0,
      boards: [],
    };
  }

  const poolIds = Array.from(new Set(players.map((p) => p.pool_id)));
  const { data: squareRows, error: squaresError } = await supabase
    .from(TABLES.squares)
    .select("*")
    .in("pool_id", poolIds);

  if (squaresError) throw squaresError;
  const squares = (squareRows ?? []) as SquareRow[];

  const aggregates = new Map<string, EmailAggregate>();
  const poolContexts = new Map<string, Map<string, PoolEmailContext>>();

  for (const player of players) {
    const email = player.email?.trim();
    if (!email) continue;

    const normalized = normalizeEmail(email);
    let aggregate = aggregates.get(normalized);
    if (!aggregate) {
      aggregate = {
        email: normalized,
        displayName: displayNameFromEmail(normalized),
        lifetimeWins: 0,
        lifetimeWinnings: 0,
        weeklyWins: 0,
        winDates: [],
        boardsPlayed: new Set(),
      };
      aggregates.set(normalized, aggregate);
    }

    aggregate.boardsPlayed.add(player.pool_id);
    if (player.name.trim()) {
      aggregate.displayName = player.name.split(" ")[0] ?? aggregate.displayName;
    }

    let poolMap = poolContexts.get(player.pool_id);
    if (!poolMap) {
      poolMap = new Map();
      poolContexts.set(player.pool_id, poolMap);
    }

    let ctx = poolMap.get(normalized);
    if (!ctx) {
      ctx = {
        displayName: aggregate.displayName,
        names: new Set(),
        squares: new Set(),
      };
      poolMap.set(normalized, ctx);
    }

    ctx.names.add(player.name.trim().toLowerCase());
    if (player.name.trim()) {
      ctx.displayName = player.name.split(" ")[0] ?? ctx.displayName;
    }
  }

  for (const square of squares) {
    if (!square.player_id || !square.claimed) continue;
    const owner = players.find((p) => p.id === square.player_id);
    if (!owner?.email) continue;

    const normalized = normalizeEmail(owner.email);
    const poolMap = poolContexts.get(square.pool_id);
    const ctx = poolMap?.get(normalized);
    if (ctx) ctx.squares.add(square.square_number);
  }

  for (const winner of winners) {
    const poolMap = poolContexts.get(winner.pool_id);
    if (!poolMap) continue;

    const wonAt = new Date(winner.created_at);
    const isWeekly = wonAt.getTime() >= weekAgo;

    for (const [email, ctx] of Array.from(poolMap.entries())) {
      if (!playerOwnsWin(winner, ctx.names, ctx.squares)) continue;

      const aggregate = aggregates.get(email);
      if (!aggregate) continue;

      aggregate.lifetimeWins += 1;
      aggregate.winDates.push(wonAt);
      if (isWeekly) aggregate.weeklyWins += 1;
      if (winner.payout_status === "paid" && winner.payout_amount) {
        aggregate.lifetimeWinnings += winner.payout_amount;
      }
      if (ctx.displayName) aggregate.displayName = ctx.displayName;
    }
  }

  const allPlayers = Array.from(aggregates.values());

  const winningsSorted = allPlayers
    .filter((p) => p.lifetimeWinnings > 0 || p.lifetimeWins > 0)
    .sort((a, b) => b.lifetimeWinnings - a.lifetimeWinnings || b.lifetimeWins - a.lifetimeWins)
    .map((p) => ({
      email: p.email,
      displayName: p.displayName,
      value: Math.round(p.lifetimeWinnings),
      valueLabel: `$${Math.round(p.lifetimeWinnings).toLocaleString()}`,
    }));

  const winsSorted = allPlayers
    .filter((p) => p.lifetimeWins > 0)
    .sort((a, b) => b.lifetimeWins - a.lifetimeWins || b.lifetimeWinnings - a.lifetimeWinnings)
    .map((p) => ({
      email: p.email,
      displayName: p.displayName,
      value: p.lifetimeWins,
      valueLabel: `${p.lifetimeWins} win${p.lifetimeWins === 1 ? "" : "s"}`,
    }));

  const weeklySorted = allPlayers
    .filter((p) => p.weeklyWins > 0)
    .sort((a, b) => b.weeklyWins - a.weeklyWins || b.lifetimeWins - a.lifetimeWins)
    .map((p) => ({
      email: p.email,
      displayName: p.displayName,
      value: p.weeklyWins,
      valueLabel: `${p.weeklyWins} this week`,
    }));

  const streakSorted = allPlayers
    .map((p) => {
      const streaks = calcWinStreaks(p.winDates);
      return {
        email: p.email,
        displayName: p.displayName,
        value: streaks.longest,
        valueLabel: `${streaks.longest} win streak`,
        current: streaks.current,
      };
    })
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value || b.current - a.current)
    .map((p) => ({
      email: p.email,
      displayName: p.displayName,
      value: p.value,
      valueLabel: p.valueLabel,
    }));

  const boards: LeaderboardBoard[] = [
    buildBoard(
      "all-time-winnings",
      "All-Time Winnings",
      "Top earners across every board",
      winningsSorted,
      normalizedViewer
    ),
    buildBoard(
      "all-time-wins",
      "All-Time Wins",
      "Most quarter wins in SquareBoards history",
      winsSorted,
      normalizedViewer
    ),
    buildBoard(
      "weekly-wins",
      "This Week",
      "Hottest players over the last 7 days",
      weeklySorted,
      normalizedViewer
    ),
    buildBoard(
      "streak-leaders",
      "Streak Leaders",
      "Longest winning runs on the platform",
      streakSorted,
      normalizedViewer
    ),
  ];

  return {
    updatedAt: new Date().toISOString(),
    totalPlayers: aggregates.size,
    boards,
  };
}
