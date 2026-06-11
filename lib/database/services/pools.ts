import { normalizeEspnSport } from "@/lib/espn/sports";
import { resolvePoolPayoutPercentages } from "@/lib/payoutTemplates";
import { generateId, getDuplicatePoolName } from "@/lib/utils";
import { createEmptySquares } from "@/lib/utils";
import type { Pool } from "@/lib/types";
import { getDatabaseClient } from "../client";
import { TABLES } from "../config";
import { assemblePool, poolToPoolRow } from "../mappers";
import {
  PUBLIC_PLAYER_SELECT,
} from "../playerFields";
import type { PlayerRow, PoolRow, SquareRow } from "../types";

export interface PoolLoadOptions {
  includeSensitive?: boolean;
}

async function insertEmptySquares(poolId: string): Promise<void> {
  const supabase = getDatabaseClient();
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

async function fetchPoolRelations(
  poolId: string,
  options: PoolLoadOptions = {}
) {
  const supabase = getDatabaseClient();
  const playersQuery = options.includeSensitive
    ? supabase.from(TABLES.players).select("*").eq("pool_id", poolId)
    : supabase
        .from(TABLES.players)
        .select(PUBLIC_PLAYER_SELECT)
        .eq("pool_id", poolId);

  const [poolRes, playersRes, squaresRes] = await Promise.all([
    supabase.from(TABLES.pools).select("*").eq("id", poolId).maybeSingle(),
    playersQuery,
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
    (playersRes.data ?? []) as unknown as PlayerRow[],
    (squaresRes.data ?? []) as SquareRow[]
  );
}

export async function dbListPoolIds(): Promise<string[]> {
  const supabase = getDatabaseClient();
  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("id")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.id as string);
}

export async function dbListPools(
  options: PoolLoadOptions = {}
): Promise<Pool[]> {
  const ids = await dbListPoolIds();
  const pools = await Promise.all(
    ids.map((id) => fetchPoolRelations(id, options))
  );
  return pools.filter((p): p is Pool => p !== null);
}

export async function dbGetPool(
  poolId: string,
  options: PoolLoadOptions = {}
): Promise<Pool | null> {
  return fetchPoolRelations(poolId, options);
}

export async function dbUpsertPool(pool: Pool): Promise<void> {
  const supabase = getDatabaseClient();
  const row = poolToPoolRow(pool);
  const { error } = await supabase.from(TABLES.pools).upsert(row);
  if (error) throw error;
}

export async function dbCreatePool(data: {
  name: string;
  homeTeam: string;
  awayTeam: string;
}): Promise<Pool> {
  const supabase = getDatabaseClient();
  const id = generateId();
  const poolRow: Omit<PoolRow, "created_at"> = {
    id,
    name: data.name,
    home_team: data.homeTeam,
    away_team: data.awayTeam,
    invite_code: generateId().toUpperCase().slice(0, 8),
    status: "open",
    top_numbers: null,
    side_numbers: null,
    espn_game_id: null,
    espn_sport: "nfl",
    cost_per_square: 0,
    service_fee_percent: 0,
    payout_template: "standard",
    payout_percentages: {},
  };

  const { error: poolError } = await supabase.from(TABLES.pools).insert(poolRow);
  if (poolError) throw poolError;

  await insertEmptySquares(id);

  const pool = await fetchPoolRelations(id);
  if (!pool) throw new Error("Failed to load pool after creation.");
  return pool;
}

export async function dbDuplicatePool(sourcePoolId: string): Promise<Pool | null> {
  const source = await dbGetPool(sourcePoolId, { includeSensitive: true });
  if (!source) return null;

  const supabase = getDatabaseClient();
  const id = generateId();
  const poolRow: Omit<PoolRow, "created_at"> = {
    id,
    name: getDuplicatePoolName(source.name),
    home_team: source.homeTeam,
    away_team: source.awayTeam,
    invite_code: generateId().toUpperCase().slice(0, 8),
    status: "open",
    top_numbers: null,
    side_numbers: null,
    espn_game_id: source.espnGameId ?? null,
    espn_sport: normalizeEspnSport(source.espnSport),
    cost_per_square: source.costPerSquare ?? 0,
    service_fee_percent: source.serviceFeePercent ?? 0,
    payout_template: source.payoutTemplate ?? "standard",
    payout_percentages: resolvePoolPayoutPercentages(source),
  };

  const { error: poolError } = await supabase.from(TABLES.pools).insert(poolRow);
  if (poolError) throw poolError;

  await insertEmptySquares(id);

  return fetchPoolRelations(id);
}

export async function dbUpdatePoolFields(
  poolId: string,
  fields: Partial<
    Pick<
      PoolRow,
      | "name"
      | "home_team"
      | "away_team"
      | "status"
      | "top_numbers"
      | "side_numbers"
      | "espn_game_id"
      | "espn_sport"
      | "cost_per_square"
      | "service_fee_percent"
      | "payout_template"
      | "payout_percentages"
    >
  >
): Promise<Pool | null> {
  const supabase = getDatabaseClient();
  const { error } = await supabase.from(TABLES.pools).update(fields).eq("id", poolId);
  if (error) throw error;
  return dbGetPool(poolId, { includeSensitive: true });
}

export async function dbSyncSquareDigits(
  poolId: string,
  topNumbers: number[],
  sideNumbers: number[]
): Promise<void> {
  const supabase = getDatabaseClient();
  const updates = Array.from({ length: 100 }, (_, squareNumber) => {
    const row = Math.floor(squareNumber / 10);
    const col = squareNumber % 10;
    return {
      pool_id: poolId,
      square_number: squareNumber,
      row_digit: sideNumbers[row],
      column_digit: topNumbers[col],
    };
  });

  for (const batch of chunk(updates, 25)) {
    for (const item of batch) {
      const { error } = await supabase
        .from(TABLES.squares)
        .update({
          row_digit: item.row_digit,
          column_digit: item.column_digit,
        })
        .eq("pool_id", poolId)
        .eq("square_number", item.square_number);
      if (error) throw error;
    }
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}
