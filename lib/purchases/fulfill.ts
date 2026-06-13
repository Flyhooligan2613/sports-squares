import { assemblePool } from "@/lib/database/mappers";
import { TABLES } from "@/lib/database/config";
import type { PlayerRow, PoolRow, SquareRow } from "@/lib/database/types";
import { sendInviteEmail } from "@/lib/email/resend";
import { buildInvitePath } from "@/lib/invites";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { sendInviteSms } from "@/lib/twilio/hooks";
import type {
  InviteDeliveryStatus,
  PaymentStatus,
  PurchaseSource,
  SmsDeliveryStatus,
} from "@/lib/types";
import { generateId, generateInviteToken, getInitials, pickColor } from "@/lib/utils";
import { getAppUrl } from "@/lib/stripe/config";
import {
  findPurchaseBySession,
  markPurchaseFailed,
  markPurchaseFulfilled,
  markPurchaseRefunded,
  reservePurchaseLedger,
} from "@/lib/purchases/ledger";

export interface PurchaseFulfillmentInput {
  poolId: string;
  name: string;
  email: string;
  phone?: string;
  squaresCount: number;
  stripeCheckoutSessionId: string;
  amountPaidCents: number;
  stripePaymentIntentId?: string | null;
}

export interface PurchaseFulfillmentResult {
  playerId: string;
  inviteToken: string;
  inviteUrl: string;
  inviteDeliveryStatus: InviteDeliveryStatus;
  smsDeliveryStatus: SmsDeliveryStatus;
  inviteDeliveryError?: string | null;
  alreadyFulfilled: boolean;
}

type AdminClient = ReturnType<typeof getSupabaseAdmin>;

async function fetchPoolAdmin(poolId: string) {
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

async function ensureInviteToken(
  supabase: AdminClient,
  row: PlayerRow
): Promise<string> {
  if (row.invite_token) return row.invite_token;

  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteToken = generateInviteToken();
    const { error } = await supabase
      .from(TABLES.players)
      .update({ invite_token: inviteToken })
      .eq("id", row.id)
      .eq("pool_id", row.pool_id);

    if (!error) return inviteToken;
    if (error.code !== "23505") throw error;
  }

  throw new Error("Could not assign an invite token for this purchase.");
}

async function fetchPoolName(
  supabase: AdminClient,
  poolId: string
): Promise<string> {
  const { data, error } = await supabase
    .from(TABLES.pools)
    .select("name")
    .eq("id", poolId)
    .maybeSingle();

  if (error) throw error;
  return (data?.name as string | undefined) ?? "Sports Squares";
}

async function deliverInviteNotifications(
  supabase: AdminClient,
  input: {
    playerId: string;
    poolId: string;
    email: string;
    phone: string | null;
    poolName: string;
    creditsPurchased: number;
    inviteUrl: string;
  }
): Promise<{
  inviteDeliveryStatus: InviteDeliveryStatus;
  inviteDeliveryError: string | null;
  inviteSentAt: string | null;
  smsDeliveryStatus: SmsDeliveryStatus;
}> {
  let inviteDeliveryStatus: InviteDeliveryStatus = "skipped";
  let inviteDeliveryError: string | null = null;
  let inviteSentAt: string | null = null;

  const emailResult = await sendInviteEmail({
    to: input.email,
    poolName: input.poolName,
    creditsPurchased: input.creditsPurchased,
    inviteUrl: input.inviteUrl,
  });

  if (emailResult.ok) {
    inviteDeliveryStatus = "sent";
    inviteSentAt = new Date().toISOString();
  } else {
    inviteDeliveryStatus = "failed";
    inviteDeliveryError = emailResult.error;
  }

  let smsDeliveryStatus: SmsDeliveryStatus = input.phone ? "pending" : "skipped";

  if (input.phone) {
    const smsResult = await sendInviteSms({
      to: input.phone,
      poolName: input.poolName,
      inviteUrl: input.inviteUrl,
    });

    if (smsResult.ok) {
      smsDeliveryStatus =
        smsResult.status === "sent" ? "sent" : "skipped";
    } else {
      smsDeliveryStatus = "failed";
    }
  }

  await supabase
    .from(TABLES.players)
    .update({
      invite_delivery_status: inviteDeliveryStatus,
      invite_sent_at: inviteSentAt,
      invite_delivery_error: inviteDeliveryError,
      sms_delivery_status: smsDeliveryStatus,
    })
    .eq("id", input.playerId)
    .eq("pool_id", input.poolId);

  return {
    inviteDeliveryStatus,
    inviteDeliveryError,
    inviteSentAt,
    smsDeliveryStatus,
  };
}

async function resultFromPlayerRow(
  supabase: AdminClient,
  row: PlayerRow,
  alreadyFulfilled: boolean
): Promise<PurchaseFulfillmentResult> {
  const inviteToken = await ensureInviteToken(supabase, row);
  const inviteUrl = `${getAppUrl()}${buildInvitePath(inviteToken)}`;

  let inviteDeliveryStatus = row.invite_delivery_status;
  let smsDeliveryStatus = row.sms_delivery_status;
  let inviteDeliveryError: string | null = row.invite_delivery_error;

  if (row.email && inviteDeliveryStatus !== "sent") {
    const poolName = await fetchPoolName(supabase, row.pool_id);
    const delivery = await deliverInviteNotifications(supabase, {
      playerId: row.id,
      poolId: row.pool_id,
      email: row.email,
      phone: row.phone,
      poolName,
      creditsPurchased: row.credits_allocated,
      inviteUrl,
    });
    inviteDeliveryStatus = delivery.inviteDeliveryStatus;
    smsDeliveryStatus = delivery.smsDeliveryStatus;
    inviteDeliveryError = delivery.inviteDeliveryError;
  }

  return {
    playerId: row.id,
    inviteToken,
    inviteUrl,
    inviteDeliveryStatus,
    smsDeliveryStatus,
    inviteDeliveryError,
    alreadyFulfilled,
  };
}

async function findPlayerByCheckoutSession(
  supabase: AdminClient,
  sessionId: string
): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from(TABLES.players)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return (data as PlayerRow | null) ?? null;
}

async function findPlayerByEmailInPool(
  supabase: AdminClient,
  poolId: string,
  email: string
): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from(TABLES.players)
    .select("*")
    .eq("pool_id", poolId)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return (data as PlayerRow | null) ?? null;
}

async function listPlayerNamesInPool(
  supabase: AdminClient,
  poolId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLES.players)
    .select("name")
    .eq("pool_id", poolId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.name));
}

function uniquePlayerName(baseName: string, existingNames: string[]): string {
  const normalized = new Set(existingNames.map((n) => n.toLowerCase()));
  if (!normalized.has(baseName.toLowerCase())) return baseName;

  let attempt = 2;
  while (normalized.has(`${baseName} (${attempt})`.toLowerCase())) {
    attempt += 1;
  }
  return `${baseName} (${attempt})`;
}

function isUniqueViolation(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23505" ||
    Boolean(error.message?.includes("duplicate key value violates unique constraint"))
  );
}

function isCheckoutSessionConflict(error: { message?: string }): boolean {
  return Boolean(
    error.message?.includes("players_stripe_checkout_session_id_unique_idx")
  );
}

async function findSessionOwner(
  supabase: AdminClient,
  sessionId: string
): Promise<PlayerRow | null> {
  return findPlayerByCheckoutSession(supabase, sessionId);
}

async function returnIfSessionAlreadyFulfilled(
  supabase: AdminClient,
  sessionId: string
): Promise<PurchaseFulfillmentResult | null> {
  const owner = await findSessionOwner(supabase, sessionId);
  if (!owner) return null;
  return resultFromPlayerRow(supabase, owner, true);
}

async function updateExistingPlayerForPurchase(
  supabase: AdminClient,
  existing: PlayerRow,
  input: PurchaseFulfillmentInput,
  email: string,
  phone: string | null,
  amountPaid: number,
  paymentStatus: PaymentStatus,
  purchaseSource: PurchaseSource,
  squaresCount: number
): Promise<{ playerId: string; inviteToken: string; creditsPurchased: number }> {
  const inviteToken = existing.invite_token || generateInviteToken();
  const creditsPurchased = existing.credits_allocated + squaresCount;

  const patch: Record<string, unknown> = {
    credits_allocated: creditsPurchased,
    invite_token: inviteToken,
    email,
    phone,
    amount_paid: Number(existing.amount_paid ?? 0) + amountPaid,
    payment_status: paymentStatus,
    purchase_source: purchaseSource,
    invite_delivery_status: "pending",
    sms_delivery_status: phone ? "pending" : "skipped",
    invite_delivery_error: null,
  };

  // Keep original checkout session on player row; purchases ledger tracks all sessions.

  const { error } = await supabase
    .from(TABLES.players)
    .update(patch)
    .eq("id", existing.id)
    .eq("pool_id", input.poolId);

  if (error) {
    if (isUniqueViolation(error)) {
      const raced = await findSessionOwner(
        supabase,
        input.stripeCheckoutSessionId
      );
      if (raced) {
        const token = await ensureInviteToken(supabase, raced);
        return {
          playerId: raced.id,
          inviteToken: token,
          creditsPurchased: raced.credits_allocated,
        };
      }
    }
    throw error;
  }

  return { playerId: existing.id, inviteToken, creditsPurchased };
}

function validatePurchaseInput(input: PurchaseFulfillmentInput): number {
  const squaresCount = Math.floor(Number(input.squaresCount));
  if (!Number.isFinite(squaresCount) || squaresCount < 1 || squaresCount > 100) {
    throw new Error("Invalid squares count for fulfillment.");
  }
  return squaresCount;
}

function validatePoolOpenForPurchase(pool: NonNullable<Awaited<ReturnType<typeof fetchPoolAdmin>>>) {
  if (pool.status !== "open") {
    throw new Error("This board is no longer open for purchases.");
  }
}

function validatePaymentAmount(
  pool: NonNullable<Awaited<ReturnType<typeof fetchPoolAdmin>>>,
  squaresCount: number,
  amountPaidCents: number
) {
  const costPerSquare = pool.costPerSquare ?? 0;
  const expectedCents = Math.round(costPerSquare * 100 * squaresCount);
  if (expectedCents <= 0) {
    throw new Error("Pool pricing is not configured.");
  }
  if (amountPaidCents !== expectedCents) {
    throw new Error("Payment amount does not match board pricing.");
  }
}

function validateInventoryCapacity(
  pool: NonNullable<Awaited<ReturnType<typeof fetchPoolAdmin>>>,
  squaresCount: number
) {
  const unclaimed = pool.squares.filter((s) => !s.claimed).length;
  const totalCredits = pool.participants.reduce(
    (sum, player) => sum + (player.creditsPurchased ?? 0),
    0
  );

  if (squaresCount > unclaimed) {
    throw new Error("Not enough squares remain on this board.");
  }

  if (totalCredits + squaresCount > 100) {
    throw new Error("This purchase would exceed board capacity.");
  }
}

export async function reversePurchaseBySession(
  sessionId: string
): Promise<{ reversed: boolean; reason?: string }> {
  const supabase = getSupabaseAdmin();
  const purchase = await findPurchaseBySession(sessionId);
  if (!purchase) return { reversed: false, reason: "Purchase not found." };
  if (purchase.status === "refunded") return { reversed: true, reason: "Already refunded." };

  if (!purchase.player_id) {
    await markPurchaseRefunded(sessionId);
    return { reversed: true };
  }

  const { data: player, error: playerError } = await supabase
    .from(TABLES.players)
    .select("*")
    .eq("id", purchase.player_id)
    .maybeSingle();

  if (playerError) throw playerError;
  if (!player) {
    await markPurchaseRefunded(sessionId);
    return { reversed: true };
  }

  const row = player as PlayerRow;
  const refundAmount = purchase.amount_cents / 100;
  const nextCredits = Math.max(0, row.credits_allocated - purchase.squares_count);
  const nextPaid = Math.max(0, Number(row.amount_paid ?? 0) - refundAmount);

  const { error: updateError } = await supabase
    .from(TABLES.players)
    .update({
      credits_allocated: nextCredits,
      amount_paid: nextPaid,
      payment_status: nextCredits > 0 ? row.payment_status : "unpaid",
    })
    .eq("id", row.id)
    .eq("pool_id", row.pool_id);

  if (updateError) throw updateError;
  await markPurchaseRefunded(sessionId);
  return { reversed: true };
}

export async function fulfillPurchase(
  input: PurchaseFulfillmentInput
): Promise<PurchaseFulfillmentResult> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;
  const squaresCount = validatePurchaseInput(input);
  const amountPaid = Math.round(input.amountPaidCents) / 100;
  const paymentStatus: PaymentStatus = "paid";
  const purchaseSource: PurchaseSource = "stripe";

  const ledgerExisting = await findPurchaseBySession(input.stripeCheckoutSessionId);
  if (ledgerExisting?.status === "fulfilled" && ledgerExisting.player_id) {
    const { data: playerRow } = await supabase
      .from(TABLES.players)
      .select("*")
      .eq("id", ledgerExisting.player_id)
      .maybeSingle();
    if (playerRow) {
      return resultFromPlayerRow(supabase, playerRow as PlayerRow, true);
    }
  }
  if (ledgerExisting?.status === "refunded") {
    throw new Error("This purchase was refunded and cannot be fulfilled.");
  }

  const alreadyFulfilled = await returnIfSessionAlreadyFulfilled(
    supabase,
    input.stripeCheckoutSessionId
  );
  if (alreadyFulfilled) return alreadyFulfilled;

  const pool = await fetchPoolAdmin(input.poolId);
  if (!pool) throw new Error("Pool not found.");

  validatePoolOpenForPurchase(pool);
  validatePaymentAmount(pool, squaresCount, input.amountPaidCents);
  validateInventoryCapacity(pool, squaresCount);

  await reservePurchaseLedger({
    sessionId: input.stripeCheckoutSessionId,
    poolId: input.poolId,
    email,
    squaresCount,
    amountCents: input.amountPaidCents,
    paymentIntentId: input.stripePaymentIntentId,
  });

  let playerId: string;
  let inviteToken = "";
  let creditsPurchased: number;
  let playerName: string;
  let reusedExisting = false;

  const existingByEmail = await findPlayerByEmailInPool(
    supabase,
    input.poolId,
    email
  );

  if (existingByEmail) {
    const sessionTaken = await returnIfSessionAlreadyFulfilled(
      supabase,
      input.stripeCheckoutSessionId
    );
    if (sessionTaken) return sessionTaken;

    const updated = await updateExistingPlayerForPurchase(
      supabase,
      existingByEmail,
      input,
      email,
      phone,
      amountPaid,
      paymentStatus,
      purchaseSource,
      squaresCount
    );
    playerId = updated.playerId;
    inviteToken = updated.inviteToken;
    creditsPurchased = updated.creditsPurchased;
    playerName = existingByEmail.name;
    reusedExisting = true;
  } else {
    const sessionTaken = await returnIfSessionAlreadyFulfilled(
      supabase,
      input.stripeCheckoutSessionId
    );
    if (sessionTaken) return sessionTaken;

    playerId = generateId();
    let takenNames = await listPlayerNamesInPool(supabase, input.poolId);
    playerName = uniquePlayerName(input.name.trim(), takenNames);
    creditsPurchased = squaresCount;

    let inserted = false;
    let lastError: { message?: string; code?: string } | null = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      inviteToken = generateInviteToken();
      const { error } = await supabase.from(TABLES.players).insert({
        id: playerId,
        pool_id: input.poolId,
        name: playerName,
        credits_allocated: creditsPurchased,
        credits_used: 0,
        initials: getInitials(playerName),
        color: pickColor(takenNames.length),
        amount_paid: amountPaid,
        payment_status: paymentStatus,
        email,
        phone,
        invite_delivery_status: "pending" as InviteDeliveryStatus,
        invite_sent_at: null,
        invite_delivery_error: null,
        sms_delivery_status: (phone ? "pending" : "skipped") as SmsDeliveryStatus,
        purchase_source: purchaseSource,
        stripe_checkout_session_id: input.stripeCheckoutSessionId,
        invite_token: inviteToken,
      });

      if (!error) {
        inserted = true;
        break;
      }

      lastError = error;
      if (!isUniqueViolation(error)) throw error;

      const raced = await findSessionOwner(
        supabase,
        input.stripeCheckoutSessionId
      );
      if (raced) {
        return resultFromPlayerRow(supabase, raced, true);
      }

      if (isCheckoutSessionConflict(error)) {
        for (let retry = 0; retry < 3; retry++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const retried = await findSessionOwner(
            supabase,
            input.stripeCheckoutSessionId
          );
          if (retried) {
            return resultFromPlayerRow(supabase, retried, true);
          }
        }
      }

      playerId = generateId();
      takenNames = await listPlayerNamesInPool(supabase, input.poolId);
      playerName = uniquePlayerName(input.name.trim(), [...takenNames, playerName]);
    }

    if (!inserted) {
      await markPurchaseFailed(input.stripeCheckoutSessionId);
      throw new Error(
        lastError?.message ||
          "Could not create player record after payment. Please refresh this page."
      );
    }
  }

  if (!inviteToken) {
    await markPurchaseFailed(input.stripeCheckoutSessionId);
    throw new Error("Could not generate invite link after payment.");
  }

  await markPurchaseFulfilled(input.stripeCheckoutSessionId, playerId);

  const inviteUrl = `${getAppUrl()}${buildInvitePath(inviteToken)}`;

  const delivery = await deliverInviteNotifications(supabase, {
    playerId,
    poolId: input.poolId,
    email,
    phone,
    poolName: pool.name,
    creditsPurchased,
    inviteUrl,
  });

  if (isSupabaseAdminConfigured()) {
    const { recordQualifiedGameplay } = await import("@/lib/platform/ecosystem/gameplay");
    await recordQualifiedGameplay({
      email,
      gameType: "squareboards",
      amountCents: input.amountPaidCents,
      isDeposit: input.amountPaidCents >= 2500,
    }).catch(() => undefined);
  }

  return {
    playerId,
    inviteToken,
    inviteUrl,
    inviteDeliveryStatus: delivery.inviteDeliveryStatus,
    smsDeliveryStatus: delivery.smsDeliveryStatus,
    inviteDeliveryError: delivery.inviteDeliveryError,
    alreadyFulfilled: false,
  };
}

export async function getFulfillmentBySessionId(
  sessionId: string
): Promise<PurchaseFulfillmentResult | null> {
  const supabase = getSupabaseAdmin();

  const purchase = await findPurchaseBySession(sessionId);
  if (purchase?.status === "fulfilled" && purchase.player_id) {
    const { data: playerRow } = await supabase
      .from(TABLES.players)
      .select("*")
      .eq("id", purchase.player_id)
      .maybeSingle();
    if (playerRow) {
      return resultFromPlayerRow(supabase, playerRow as PlayerRow, true);
    }
  }

  const row = await findPlayerByCheckoutSession(supabase, sessionId);
  if (!row) return null;

  return resultFromPlayerRow(supabase, row, true);
}
