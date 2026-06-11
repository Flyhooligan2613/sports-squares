import { TABLES } from "@/lib/database/config";
import { playerRowToParticipant } from "@/lib/database/mappers";
import type { PlayerRow } from "@/lib/database/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PlayerInviteInfo } from "@/lib/types";
import { dbGetPool } from "@/lib/database/services/pools";

export async function resolveInviteToken(
  inviteToken: string
): Promise<PlayerInviteInfo | null> {
  const trimmed = inviteToken.trim();
  if (!trimmed) return null;

  const supabase = getSupabaseAdmin();
  const { data: playerRow, error } = await supabase
    .from(TABLES.players)
    .select("*")
    .eq("invite_token", trimmed)
    .maybeSingle();

  if (error || !playerRow) return null;

  const row = playerRow as PlayerRow;
  const pool = await dbGetPool(row.pool_id, { includeSensitive: true });
  if (!pool) return null;

  const player = pool.participants.find((p) => p.id === row.id);
  const participant = player ?? playerRowToParticipant(row);

  return {
    player: participant,
    poolId: pool.id,
    poolName: pool.name,
    homeTeam: pool.homeTeam,
    awayTeam: pool.awayTeam,
    poolStatus: pool.status,
  };
}

export async function validateInviteForClaim(
  poolId: string,
  playerId: string,
  inviteToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = inviteToken.trim();
  if (!trimmed) {
    return { ok: false, error: "A valid invite link is required to claim squares." };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.players)
    .select("id, pool_id, invite_token")
    .eq("id", playerId)
    .eq("pool_id", poolId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Player not found for this invite." };
  }

  if (data.invite_token !== trimmed) {
    return { ok: false, error: "Invite link does not match this player." };
  }

  return { ok: true };
}
