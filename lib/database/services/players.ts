import {
  createParticipantWithCredits,
  normalizePoolParticipants,
  syncParticipantCredits,
} from "@/lib/credits";
import { calcAmountDue } from "@/lib/poolFinance";
import type {
  Participant,
  PaymentStatus,
  PlayerContactInput,
  Pool,
} from "@/lib/types";
import { generateInviteToken, pickColor } from "@/lib/utils";
import { getDatabaseClient } from "../client";
import { TABLES } from "../config";
import { participantToPlayerRow } from "../mappers";
import type { PlayerRow } from "../types";
import { dbGetPool } from "./pools";

const UNIQUE_VIOLATION = "23505";
const MAX_TOKEN_ATTEMPTS = 5;

async function assignUniqueInviteToken(
  poolId: string,
  playerId: string
): Promise<string | null> {
  const supabase = getDatabaseClient();

  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt++) {
    const token = generateInviteToken();
    const { error } = await supabase
      .from(TABLES.players)
      .update({ invite_token: token })
      .eq("id", playerId)
      .eq("pool_id", poolId);

    if (!error) return token;
    if (error.code !== UNIQUE_VIOLATION) return null;
  }

  return null;
}

export async function dbCreatePlayer(
  poolId: string,
  name: string,
  creditsPurchased: number,
  contact?: PlayerContactInput
): Promise<Pool | null> {
  const trimmed = name.trim();
  if (!trimmed || creditsPurchased < 0) return null;

  const pool = await dbGetPool(poolId, { includeSensitive: true });
  if (!pool) return null;

  if (
    pool.participants.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    return null;
  }

  const player = createParticipantWithCredits(trimmed, creditsPurchased, contact);
  player.color = pickColor(pool.participants.length);

  const supabase = getDatabaseClient();
  const row = participantToPlayerRow(player, poolId);

  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt++) {
    const inviteToken = generateInviteToken();
    const { error } = await supabase
      .from(TABLES.players)
      .insert({ ...row, invite_token: inviteToken });
    if (!error) {
      return dbGetPool(poolId, { includeSensitive: true });
    }
    if (error.code !== UNIQUE_VIOLATION) return null;
  }

  return null;
}

export async function dbUpdatePlayerCredits(
  poolId: string,
  playerId: string,
  creditsPurchased: number
): Promise<Pool | null> {
  return dbUpdatePlayer(poolId, playerId, { creditsPurchased });
}

export async function dbUpdatePlayer(
  poolId: string,
  playerId: string,
  data: {
    creditsPurchased?: number;
    email?: string | null;
    phone?: string | null;
  }
): Promise<Pool | null> {
  const pool = await dbGetPool(poolId, { includeSensitive: true });
  if (!pool) return null;

  const player = pool.participants.find((p) => p.id === playerId);
  if (!player) return null;

  const squaresOwned = pool.squares.filter((s) => s.owner?.id === playerId).length;
  const creditsPurchased = data.creditsPurchased ?? player.creditsPurchased;

  if (creditsPurchased < 0 || creditsPurchased < squaresOwned) return null;

  const synced = syncParticipantCredits(
    {
      ...player,
      creditsPurchased,
      email:
        data.email !== undefined
          ? data.email?.trim() || undefined
          : player.email,
      phone:
        data.phone !== undefined
          ? data.phone?.trim() || undefined
          : player.phone,
    },
    squaresOwned
  );

  const supabase = getDatabaseClient();
  const { error } = await supabase
    .from(TABLES.players)
    .update({
      credits_allocated: synced.creditsPurchased,
      credits_used: synced.creditsUsed,
      email: synced.email?.trim() || null,
      phone: synced.phone?.trim() || null,
    })
    .eq("id", playerId)
    .eq("pool_id", poolId);

  if (error) return null;
  return dbGetPool(poolId, { includeSensitive: true });
}

export async function dbEnsureInviteToken(
  poolId: string,
  playerId: string
): Promise<string | null> {
  const pool = await dbGetPool(poolId, { includeSensitive: true });
  if (!pool) return null;

  const player = pool.participants.find((p) => p.id === playerId);
  if (!player) return null;

  if (player.inviteToken) return player.inviteToken;

  return assignUniqueInviteToken(poolId, playerId);
}

export async function dbUpdatePlayerPayment(
  poolId: string,
  playerId: string,
  status: "paid" | "unpaid"
): Promise<Pool | null> {
  const pool = await dbGetPool(poolId, { includeSensitive: true });
  if (!pool) return null;

  const player = pool.participants.find((p) => p.id === playerId);
  if (!player) return null;

  const amountDue = calcAmountDue(
    player.creditsPurchased,
    pool.costPerSquare ?? 0
  );
  const amountPaid = status === "paid" ? amountDue : 0;
  const paymentStatus: PaymentStatus =
    status === "paid" ? "paid" : "unpaid";

  const supabase = getDatabaseClient();
  const { error } = await supabase
    .from(TABLES.players)
    .update({
      amount_paid: amountPaid,
      payment_status: paymentStatus,
    })
    .eq("id", playerId)
    .eq("pool_id", poolId);

  if (error) return null;
  return dbGetPool(poolId, { includeSensitive: true });
}

export async function dbSyncPlayersFromPool(pool: Pool): Promise<void> {
  const supabase = getDatabaseClient();
  normalizePoolParticipants(pool);

  for (const participant of pool.participants) {
    const row = participantToPlayerRow(participant, pool.id);
    const { error } = await supabase.from(TABLES.players).upsert(row);
    if (error) throw error;
  }
}
