import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { dbUpdateWinnerPayoutStatus } from "@/lib/database/services/winners";
import { PaymentEngine } from "@/lib/platform/engines/payment";
import { resolvePayoutRecipient } from "@/lib/payouts/recipient";
import type { ScoringPeriod, WinnerResult } from "@/lib/types";

const TABLE = "payout_jobs";
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5 * 60 * 1000;

export type PayoutJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface PayoutJobRow {
  id: string;
  pool_id: string;
  winner_id: string | null;
  quarter: string;
  winning_player: string;
  winning_square: number;
  amount_cents: number;
  status: PayoutJobStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  stripe_transfer_id: string | null;
  idempotency_key: string;
}

function idempotencyKey(poolId: string, quarter: ScoringPeriod): string {
  return `${poolId}:${quarter}`;
}

export async function enqueuePayoutJob(input: {
  poolId: string;
  winnerId?: string | null;
  result: WinnerResult;
}): Promise<{ created: boolean; jobId?: string }> {
  const amount = input.result.payoutAmount ?? 0;
  if (amount <= 0) return { created: false };

  const supabase = getSupabaseAdmin();
  const key = idempotencyKey(input.poolId, input.result.quarter);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      pool_id: input.poolId,
      winner_id: input.winnerId ?? null,
      quarter: input.result.quarter,
      winning_player: input.result.ownerName,
      winning_square: input.result.squareId,
      amount_cents: Math.round(amount * 100),
      status: "queued",
      idempotency_key: key,
    })
    .select("id")
    .single();

  if (error?.code === "23505") return { created: false };
  if (error) throw error;

  return { created: true, jobId: data.id as string };
}

export async function completePayoutJobManually(
  poolId: string,
  quarter: ScoringPeriod
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const key = idempotencyKey(poolId, quarter);
  const now = new Date().toISOString();

  await supabase
    .from(TABLE)
    .update({
      status: "completed",
      processed_at: now,
      updated_at: now,
      last_error: "Marked paid manually by admin.",
      next_retry_at: null,
    })
    .eq("idempotency_key", key)
    .in("status", ["queued", "failed", "processing"]);
}

async function attemptStripeTransfer(
  job: PayoutJobRow
): Promise<{ ok: boolean; transferId?: string; error?: string; retryable?: boolean }> {
  if (!PaymentEngine.isConnectEnabled()) {
    return {
      ok: false,
      retryable: true,
      error: "Stripe Connect payouts not enabled. Set STRIPE_CONNECT_ENABLED=true.",
    };
  }

  const recipient = await resolvePayoutRecipient({
    poolId: job.pool_id,
    winningSquare: job.winning_square,
    winningPlayer: job.winning_player,
  });

  if (!recipient.ok) {
    return {
      ok: false,
      retryable: recipient.reason === "no_connect_account",
      error: recipient.message,
    };
  }

  try {
    const transfer = await PaymentEngine.createPayout({
      email: recipient.recipient.email,
      amountCents: job.amount_cents,
      destinationAccountId: recipient.recipient.connectAccountId,
      idempotencyKey: job.idempotency_key,
      metadata: {
        pool_id: job.pool_id,
        quarter: job.quarter,
        payout_job_id: job.id,
        recipient_email: recipient.recipient.email,
      },
    });

    if (!transfer.ok || !transfer.providerTransactionId) {
      return {
        ok: false,
        retryable: transfer.error?.retryable ?? true,
        error: transfer.error?.message ?? "Transfer failed.",
      };
    }

    return { ok: true, transferId: transfer.providerTransactionId };
  } catch (err) {
    return {
      ok: false,
      retryable: true,
      error: err instanceof Error ? err.message : "Transfer failed.",
    };
  }
}

export interface PayoutWorkerResult {
  processed: number;
  completed: number;
  failed: number;
  retried: number;
  cancelled: number;
  errors: string[];
}

export async function processPayoutJobs(limit = 20): Promise<PayoutWorkerResult> {
  const result: PayoutWorkerResult = {
    processed: 0,
    completed: 0,
    failed: 0,
    retried: 0,
    cancelled: 0,
    errors: [],
  };

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: jobs, error } = await supabase
    .from(TABLE)
    .select("*")
    .in("status", ["queued", "failed"])
    .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!jobs?.length) return result;

  for (const raw of jobs as PayoutJobRow[]) {
    result.processed += 1;

    const { error: lockError } = await supabase
      .from(TABLE)
      .update({
        status: "processing",
        attempts: raw.attempts + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", raw.id)
      .in("status", ["queued", "failed"]);

    if (lockError) {
      result.errors.push(`${raw.id}: lock failed`);
      continue;
    }

    try {
      const transfer = await attemptStripeTransfer(raw);

      if (transfer.ok && transfer.transferId) {
        await supabase
          .from(TABLE)
          .update({
            status: "completed",
            stripe_transfer_id: transfer.transferId,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("id", raw.id);

        await dbUpdateWinnerPayoutStatus(
          raw.pool_id,
          raw.quarter as ScoringPeriod,
          "paid"
        );

        const { publishPlatformEvent } = await import("@/lib/events/engine");
        await publishPlatformEvent({
          type: "game.payout_completed",
          priority: "critical",
          summary: `Payout completed for ${raw.winning_player} (${raw.quarter})`,
          gameType: "squareboards",
          entityType: "pool",
          entityId: raw.pool_id,
          payload: {
            quarter: raw.quarter,
            winningPlayer: raw.winning_player,
            amountCents: raw.amount_cents,
            stripeTransferId: transfer.transferId,
            jobId: raw.id,
          },
          idempotencyKey: `${raw.pool_id}:${raw.quarter}:payout_completed`,
        });

        result.completed += 1;
        continue;
      }

      const attempts = raw.attempts + 1;
      const isUnclaimed =
        transfer.error?.includes("unclaimed") ||
        transfer.error?.includes("Unclaimed");

      if (isUnclaimed) {
        await supabase
          .from(TABLE)
          .update({
            status: "cancelled",
            last_error: transfer.error ?? "Unclaimed square",
            updated_at: new Date().toISOString(),
          })
          .eq("id", raw.id);
        result.cancelled += 1;
        continue;
      }

      const exhausted = attempts >= (raw.max_attempts || MAX_ATTEMPTS);
      const nextRetry = new Date(Date.now() + RETRY_DELAY_MS).toISOString();

      await supabase
        .from(TABLE)
        .update({
          status: exhausted ? "failed" : "queued",
          last_error: transfer.error ?? "Transfer failed",
          next_retry_at: exhausted || !transfer.retryable ? null : nextRetry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", raw.id);

      if (exhausted) {
        result.failed += 1;
        result.errors.push(`${raw.id}: ${transfer.error ?? "exhausted retries"}`);
      } else {
        result.retried += 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      await supabase
        .from(TABLE)
        .update({
          status: "queued",
          last_error: message,
          next_retry_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", raw.id);
      result.retried += 1;
      result.errors.push(`${raw.id}: ${message}`);
    }
  }

  return result;
}
