import { syncParticipantCredits } from "@/lib/credits";
import type { ClaimResult, Pool } from "@/lib/types";
import { getDatabaseClient } from "../client";
import { TABLES } from "../config";
import { dbGetPool } from "./pools";

export async function dbClaimSquares(
  poolId: string,
  squareIds: number[],
  participantId: string
): Promise<ClaimResult> {
  const pool = await dbGetPool(poolId);
  if (!pool || pool.status !== "open") {
    return { ok: false, error: "Pool is not open for claiming." };
  }

  const player = pool.participants.find((p) => p.id === participantId);
  if (!player) {
    return {
      ok: false,
      error: "Player not registered. Ask admin to add you.",
    };
  }

  if (squareIds.length === 0) {
    return { ok: false, error: "Select at least one square." };
  }

  if (squareIds.length > player.creditsRemaining) {
    return { ok: false, error: "Not enough credits remaining." };
  }

  for (const squareId of squareIds) {
    const square = pool.squares[squareId];
    if (!square || square.claimed) {
      return { ok: false, error: "One or more squares are already claimed." };
    }
  }

  const supabase = getDatabaseClient();

  for (const squareId of squareIds) {
    const { error } = await supabase
      .from(TABLES.squares)
      .update({ claimed: true, player_id: participantId })
      .eq("pool_id", poolId)
      .eq("square_number", squareId);
    if (error) {
      return { ok: false, error: "Failed to claim squares." };
    }
  }

  const squaresOwned =
    pool.squares.filter((s) => s.owner?.id === player.id).length +
    squareIds.length;
  const synced = syncParticipantCredits(player, squaresOwned);

  const { error: playerError } = await supabase
    .from(TABLES.players)
    .update({ credits_used: synced.creditsUsed })
    .eq("id", participantId)
    .eq("pool_id", poolId);

  if (playerError) {
    return { ok: false, error: "Failed to update player credits." };
  }

  const updated = await dbGetPool(poolId);
  if (!updated) {
    return { ok: false, error: "Failed to reload pool." };
  }

  return { ok: true, pool: updated };
}

export async function dbSyncSquaresFromPool(pool: Pool): Promise<void> {
  const supabase = getDatabaseClient();

  for (const square of pool.squares) {
    const { error } = await supabase
      .from(TABLES.squares)
      .update({
        claimed: square.claimed,
        player_id: square.owner?.id ?? null,
      })
      .eq("pool_id", pool.id)
      .eq("square_number", square.id);
    if (error) throw error;
  }
}
