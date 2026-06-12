import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PurchaseLedgerStatus = "pending" | "fulfilled" | "refunded" | "failed";

export interface PurchaseLedgerRow {
  id: string;
  stripe_checkout_session_id: string;
  pool_id: string;
  player_id: string | null;
  email: string;
  squares_count: number;
  amount_cents: number;
  status: PurchaseLedgerStatus;
  stripe_payment_intent_id: string | null;
  fulfilled_at: string | null;
}

const WEBHOOK_TABLE = "stripe_webhook_events";
const PURCHASES_TABLE = "purchases";

export async function recordWebhookEvent(
  eventId: string,
  eventType: string
): Promise<"new" | "duplicate"> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(WEBHOOK_TABLE).insert({
    event_id: eventId,
    event_type: eventType,
  });

  if (error?.code === "23505") return "duplicate";
  if (error) throw error;
  return "new";
}

export async function findPurchaseBySession(
  sessionId: string
): Promise<PurchaseLedgerRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(PURCHASES_TABLE)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return (data as PurchaseLedgerRow | null) ?? null;
}

export async function findPurchaseByPaymentIntent(
  paymentIntentId: string
): Promise<PurchaseLedgerRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(PURCHASES_TABLE)
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) throw error;
  return (data as PurchaseLedgerRow | null) ?? null;
}

export async function reservePurchaseLedger(input: {
  sessionId: string;
  poolId: string;
  email: string;
  squaresCount: number;
  amountCents: number;
  paymentIntentId?: string | null;
}): Promise<{ row: PurchaseLedgerRow; created: boolean }> {
  const existing = await findPurchaseBySession(input.sessionId);
  if (existing) return { row: existing, created: false };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(PURCHASES_TABLE)
    .insert({
      stripe_checkout_session_id: input.sessionId,
      pool_id: input.poolId,
      email: input.email.trim().toLowerCase(),
      squares_count: input.squaresCount,
      amount_cents: input.amountCents,
      status: "pending",
      stripe_payment_intent_id: input.paymentIntentId ?? null,
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const raced = await findPurchaseBySession(input.sessionId);
    if (!raced) throw error;
    return { row: raced, created: false };
  }
  if (error) throw error;

  return { row: data as PurchaseLedgerRow, created: true };
}

export async function markPurchaseFulfilled(
  sessionId: string,
  playerId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(PURCHASES_TABLE)
    .update({
      status: "fulfilled",
      player_id: playerId,
      fulfilled_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", sessionId);

  if (error) throw error;
}

export async function markPurchaseRefunded(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(PURCHASES_TABLE)
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", sessionId);

  if (error) throw error;
}

export async function markPurchaseFailed(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from(PURCHASES_TABLE)
    .update({ status: "failed" })
    .eq("stripe_checkout_session_id", sessionId);
}
