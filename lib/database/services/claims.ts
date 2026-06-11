import { syncParticipantCredits } from "@/lib/credits";
import type { ClaimResult } from "@/lib/types";
import { validateInviteForClaim } from "@/lib/invites/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "../config";
import { dbGetPool } from "./pools";

export async function dbClaimSquaresWithInvite(
  poolId: string,
  squareIds: number[],
  participantId: string,
  inviteToken: string
): Promise<ClaimResult> {
  const auth = await validateInviteForClaim(poolId, participantId, inviteToken);
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const pool = await dbGetPool(poolId, { includeSensitive: true });
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

  const supabase = getSupabaseAdmin();

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
