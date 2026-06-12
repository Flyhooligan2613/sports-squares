import {
  buildGamePoolName,
  dbGetGame,
} from "@/lib/database/services/games";
import {
  dbSyncSquareDigits,
  dbUpdatePoolFields,
} from "@/lib/database/services/pools";
import { generateBoardNumbers } from "@/lib/engines/numberDraw";
import { getDefaultCostForSport } from "@/lib/marketplace/config";
import type { Game, Pool } from "@/lib/types";
import { generateId, createEmptySquares } from "@/lib/utils";
import { TABLES } from "../config";
import type { PoolRow } from "../types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { assemblePool } from "../mappers";
import type { PlayerRow, SquareRow } from "../types";

async function insertEmptySquares(poolId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const squareRows = createEmptySquares().map((square) => ({
    id: generateId(),
    pool_id: poolId,
    square_number: square.id,
    player_id: null,
    claimed: false,
    row_digit: null,
    column_digit: null,
  }));

  const { error } = await supabase.from(TABLES.squares).insert(squareRows);
  if (error) throw error;
}

export async function dbCountUnclaimedSquares(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(TABLES.squares)
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId)
    .eq("claimed", false);

  if (error) throw error;
  return count ?? 0;
}

export async function dbListBoardsForGame(gameId: string): Promise<PoolRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("*")
    .eq("game_id", gameId)
    .order("board_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PoolRow[];
}

export async function dbGetOpenBoardForGame(
  gameId: string
): Promise<PoolRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("*")
    .eq("game_id", gameId)
    .eq("status", "open")
    .order("board_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as PoolRow | null) ?? null;
}

export async function dbGetMaxBoardIndex(gameId: string): Promise<number> {
  const boards = await dbListBoardsForGame(gameId);
  if (boards.length === 0) return 0;
  return Math.max(...boards.map((b) => b.board_index ?? 1));
}

export async function dbCreateMarketplaceBoard(
  game: Game,
  boardIndex: number
): Promise<PoolRow> {
  const supabase = getSupabaseAdmin();
  const id = generateId();
  const cost = getDefaultCostForSport(game.espnSport);

  const poolRow: Omit<PoolRow, "created_at"> = {
    id,
    name: buildGamePoolName(
      game.awayTeam,
      game.homeTeam,
      game.kickoffAt,
      boardIndex
    ),
    home_team: game.homeTeam,
    away_team: game.awayTeam,
    invite_code: generateId().toUpperCase().slice(0, 8),
    status: "open",
    top_numbers: null,
    side_numbers: null,
    espn_game_id: game.espnGameId,
    espn_sport: game.espnSport,
    cost_per_square: cost,
    service_fee_percent: 0,
    payout_template: "standard",
    payout_percentages: {},
    game_id: game.id,
    board_index: boardIndex,
    kickoff_at: game.kickoffAt,
    auto_created: true,
    locked_at: null,
    marketplace_visible: true,
  };

  const { error: poolError } = await supabase.from(TABLES.pools).insert(poolRow);
  if (poolError) throw poolError;

  await insertEmptySquares(id);

  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PoolRow;
}

export async function dbLoadPoolRow(poolId: string): Promise<Pool | null> {
  const supabase = getSupabaseAdmin();
  const [poolRes, playersRes, squaresRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").eq("id", poolId).maybeSingle(),
    supabase.from(TABLES.players).select("*").eq("pool_id", poolId),
    supabase
      .from(TABLES.squares)
      .select("*")
      .eq("pool_id", poolId)
      .order("square_number"),
  ]);

  if (poolRes.error) throw poolRes.error;
  if (playersRes.error) throw playersRes.error;
  if (squaresRes.error) throw squaresRes.error;
  if (!poolRes.data) return null;

  return assemblePool(
    poolRes.data as PoolRow,
    (playersRes.data ?? []) as PlayerRow[],
    (squaresRes.data ?? []) as SquareRow[]
  );
}

export async function dbLockAndDrawBoard(poolId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: pool, error: poolError } = await supabase
    .from(TABLES.pools)
    .select("status")
    .eq("id", poolId)
    .maybeSingle();

  if (poolError) throw poolError;
  if (!pool || pool.status !== "open") return;

  const { topNumbers, sideNumbers } = generateBoardNumbers();
  const lockedAt = new Date().toISOString();

  await dbUpdatePoolFields(poolId, {
    status: "locked",
    locked_at: lockedAt,
    top_numbers: topNumbers,
    side_numbers: sideNumbers,
  });

  await dbSyncSquareDigits(poolId, topNumbers, sideNumbers);

  await dbUpdatePoolFields(poolId, {
    status: "numbers-drawn",
  });
}

export async function dbCountClaimedSquares(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(TABLES.squares)
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId)
    .eq("claimed", true);

  if (error) throw error;
  return count ?? 0;
}

export async function dbEnsureBoardForGame(gameId: string): Promise<PoolRow> {
  const game = await dbGetGame(gameId);
  if (!game) throw new Error(`Game not found: ${gameId}`);

  const openBoard = await dbGetOpenBoardForGame(gameId);
  if (openBoard) return openBoard;

  const nextIndex = (await dbGetMaxBoardIndex(gameId)) + 1;
  return dbCreateMarketplaceBoard(game, nextIndex);
}
