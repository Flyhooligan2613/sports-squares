import type { Pool } from "@/lib/types";
import { generateId, generateInviteToken } from "@/lib/utils";
import { getDatabaseClient } from "../client";
import { TABLES } from "../config";
import { participantToPlayerRow, poolToPoolRow } from "../mappers";
import { dbGetPool } from "./pools";

/** Push a localStorage pool snapshot into Supabase (idempotent upsert). */
export async function dbMigratePoolSnapshot(pool: Pool): Promise<void> {
  const existing = await dbGetPool(pool.id);
  if (existing) return;

  const supabase = getDatabaseClient();

  const { error: poolError } = await supabase
    .from(TABLES.pools)
    .upsert(poolToPoolRow(pool));
  if (poolError) throw poolError;

  if (pool.participants.length > 0) {
    const playerRows = pool.participants.map((p) => {
      const row = participantToPlayerRow(
        p.inviteToken ? p : { ...p, inviteToken: generateInviteToken() },
        pool.id
      );
      return row;
    });
    const { error: playersError } = await supabase
      .from(TABLES.players)
      .upsert(playerRows);
    if (playersError) throw playersError;
  }

  const squareRows = pool.squares.map((square) => {
    const row = Math.floor(square.id / 10);
    const col = square.id % 10;
    return {
      id: generateId(),
      pool_id: pool.id,
      square_number: square.id,
      player_id: square.owner?.id ?? null,
      claimed: square.claimed,
      row_digit: pool.sideNumbers?.[row] ?? null,
      column_digit: pool.topNumbers?.[col] ?? null,
    };
  });

  const { error: squaresError } = await supabase
    .from(TABLES.squares)
    .insert(squareRows);
  if (squaresError) throw squaresError;
}
