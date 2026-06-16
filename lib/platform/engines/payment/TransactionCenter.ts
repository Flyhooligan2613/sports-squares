import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  PaymentAuditEntry,
  PaymentProviderId,
  PaymentTransactionRecord,
  PaymentTransactionStatus,
  PaymentTransactionType,
  PaymentMethodType,
  WalletBalanceType,
} from "@/lib/platform/engines/payment/types";

const TABLE = "payment_transactions";

function generateTransactionId(): string {
  return `ptx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapRow(row: Record<string, unknown>): PaymentTransactionRecord {
  return {
    id: row.id as string,
    playerEmail: row.player_email as string,
    playerId: (row.player_id as string | null) ?? null,
    contestId: (row.contest_id as string | null) ?? null,
    poolId: (row.pool_id as string | null) ?? null,
    provider: row.provider as PaymentProviderId,
    providerTransactionId: (row.provider_transaction_id as string | null) ?? null,
    walletType: (row.wallet_type as WalletBalanceType | null) ?? null,
    paymentMethodType: (row.payment_method_type as PaymentMethodType | null) ?? null,
    paymentMethodLast4: (row.payment_method_last4 as string | null) ?? null,
    transactionType: row.transaction_type as PaymentTransactionType,
    amountCents: row.amount_cents as number,
    feesCents: (row.fees_cents as number) ?? 0,
    currency: (row.currency as string) ?? "usd",
    status: row.status as PaymentTransactionStatus,
    idempotencyKey: (row.idempotency_key as string | null) ?? null,
    errorCode: (row.error_code as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    auditLog: (row.audit_log as PaymentAuditEntry[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export interface RecordTransactionInput {
  playerEmail: string;
  playerId?: string | null;
  contestId?: string | null;
  poolId?: string | null;
  provider: PaymentProviderId;
  providerTransactionId?: string | null;
  walletType?: WalletBalanceType | null;
  paymentMethodType?: PaymentMethodType | null;
  paymentMethodLast4?: string | null;
  transactionType: PaymentTransactionType;
  amountCents: number;
  feesCents?: number;
  currency?: string;
  status: PaymentTransactionStatus;
  idempotencyKey?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  auditAction?: string;
  auditDetail?: string;
}

export async function recordPaymentTransaction(
  input: RecordTransactionInput
): Promise<PaymentTransactionRecord> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const auditLog: PaymentAuditEntry[] = input.auditAction
    ? [{ at: now, action: input.auditAction, detail: input.auditDetail }]
    : [];

  if (input.idempotencyKey) {
    const { data: existing } = await supabase
      .from(TABLE)
      .select("*")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();

    if (existing) return mapRow(existing as Record<string, unknown>);
  }

  const id = generateTransactionId();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      id,
      player_email: normalizeEmail(input.playerEmail),
      player_id: input.playerId ?? null,
      contest_id: input.contestId ?? null,
      pool_id: input.poolId ?? null,
      provider: input.provider,
      provider_transaction_id: input.providerTransactionId ?? null,
      wallet_type: input.walletType ?? null,
      payment_method_type: input.paymentMethodType ?? null,
      payment_method_last4: input.paymentMethodLast4 ?? null,
      transaction_type: input.transactionType,
      amount_cents: input.amountCents,
      fees_cents: input.feesCents ?? 0,
      currency: input.currency ?? "usd",
      status: input.status,
      idempotency_key: input.idempotencyKey ?? null,
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
      audit_log: auditLog,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error?.code === "23505" && input.idempotencyKey) {
    const { data: raced } = await supabase
      .from(TABLE)
      .select("*")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();
    if (raced) return mapRow(raced as Record<string, unknown>);
  }

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function updatePaymentTransactionStatus(input: {
  id: string;
  status: PaymentTransactionStatus;
  providerTransactionId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  auditAction?: string;
  auditDetail?: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from(TABLE)
    .select("audit_log")
    .eq("id", input.id)
    .maybeSingle();

  const auditLog = [
    ...((existing?.audit_log as PaymentAuditEntry[]) ?? []),
    ...(input.auditAction
      ? [{ at: now, action: input.auditAction, detail: input.auditDetail }]
      : []),
  ];

  const { error } = await supabase
    .from(TABLE)
    .update({
      status: input.status,
      provider_transaction_id: input.providerTransactionId,
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
      audit_log: auditLog,
      updated_at: now,
    })
    .eq("id", input.id);

  if (error) throw error;
}

export async function getPaymentTransactionById(
  id: string
): Promise<PaymentTransactionRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function listPaymentTransactionsForPlayer(
  email: string,
  limit = 50
): Promise<PaymentTransactionRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("player_email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getPaymentTransactionByProviderId(
  providerTransactionId: string
): Promise<PaymentTransactionRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("provider_transaction_id", providerTransactionId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}
