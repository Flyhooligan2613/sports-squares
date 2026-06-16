import { createPlayerMagicLink } from "@/lib/auth/playerMagicLink";
import { TABLES } from "@/lib/database/config";
import type { PlayerRow, PoolRow } from "@/lib/database/types";
import type { PurchaseFulfillmentResult } from "@/lib/purchases/fulfill";
import {
  formatPurchaseKickoff,
  type PurchaseSuccessSummary,
} from "@/lib/purchases/successSummary";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PaymentEngine } from "@/lib/platform/engines/payment";

export interface PurchaseStatusPayload {
  status: "fulfilled";
  inviteUrl: string;
  invitePath: string;
  inviteToken: string;
  playerId: string;
  inviteDeliveryStatus: string;
  inviteDeliveryError: string | null;
  smsDeliveryStatus: string;
  summary: PurchaseSuccessSummary;
  playerAccessUrl: string | null;
}

async function loadPlayerBySession(
  sessionId: string
): Promise<PlayerRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.players)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return (data as PlayerRow | null) ?? null;
}

async function loadPool(poolId: string): Promise<PoolRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("*")
    .eq("id", poolId)
    .maybeSingle();

  if (error) throw error;
  return (data as PoolRow | null) ?? null;
}

export async function buildPurchaseStatusPayload(
  sessionId: string,
  result: PurchaseFulfillmentResult
): Promise<PurchaseStatusPayload> {
  const stripeSession = await PaymentEngine.retrieveCheckoutSession(sessionId);
  if (!stripeSession) {
    throw new Error("Checkout session not found.");
  }
  const metadata = stripeSession.metadata ?? {};
  const player = await loadPlayerBySession(sessionId);
  const poolId = String(metadata.poolId ?? player?.pool_id ?? "");
  const pool = poolId ? await loadPool(poolId) : null;

  const email = String(metadata.email ?? player?.email ?? "")
    .trim()
    .toLowerCase();

  const squaresPurchased = Number(metadata.squaresCount ?? player?.credits_allocated ?? 0);
  const totalPaid =
    stripeSession.amountCents != null
      ? stripeSession.amountCents / 100
      : Number(player?.amount_paid ?? 0);

  const kickoffAt = pool?.kickoff_at ?? null;
  const playerAccessUrl = email ? await createPlayerMagicLink(email) : null;

  return {
    status: "fulfilled",
    inviteUrl: result.inviteUrl,
    invitePath: `/join/${result.inviteToken}`,
    inviteToken: result.inviteToken,
    playerId: result.playerId,
    inviteDeliveryStatus: result.inviteDeliveryStatus,
    inviteDeliveryError: result.inviteDeliveryError ?? null,
    smsDeliveryStatus: result.smsDeliveryStatus,
    playerAccessUrl,
    summary: {
      email,
      homeTeam: pool?.home_team ?? "Home",
      awayTeam: pool?.away_team ?? "Away",
      boardIndex: pool?.board_index ?? 1,
      squaresPurchased,
      totalPaid,
      kickoffAt,
      kickoffLabel: formatPurchaseKickoff(kickoffAt),
    },
  };
}
