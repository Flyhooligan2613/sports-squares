import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { DEPOSIT_WITHDRAW_HOLD_HOURS } from "./config";

export type WithdrawalHoldReason = "rapid_deposit_withdraw" | "large_withdrawal" | "kyc_pending";

export interface WithdrawalReviewContext {
  requiresReview: boolean;
  reason?: WithdrawalHoldReason;
  holdUntil?: Date;
  recentDeposit?: {
    ledgerId: string;
    amountCents: number;
    depositedAt: string;
  };
}

export async function evaluateWithdrawalReview(input: {
  email: string;
  amountCents: number;
  largeWithdrawalThresholdCents: number;
}): Promise<WithdrawalReviewContext> {
  if (input.amountCents >= input.largeWithdrawalThresholdCents) {
    const holdUntil = new Date();
    holdUntil.setHours(holdUntil.getHours() + DEPOSIT_WITHDRAW_HOLD_HOURS);
    return { requiresReview: true, reason: "large_withdrawal", holdUntil };
  }

  const recentDeposit = await findRecentDepositWithinHoldWindow(input.email);
  if (recentDeposit) {
    const holdUntil = new Date(recentDeposit.depositedAt);
    holdUntil.setHours(holdUntil.getHours() + DEPOSIT_WITHDRAW_HOLD_HOURS);
    return {
      requiresReview: true,
      reason: "rapid_deposit_withdraw",
      holdUntil,
      recentDeposit,
    };
  }

  return { requiresReview: false };
}

async function findRecentDepositWithinHoldWindow(email: string) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const cutoff = new Date(Date.now() - DEPOSIT_WITHDRAW_HOLD_HOURS * 60 * 60 * 1000).toISOString();

  const { data: account } = await supabase
    .from("square_bank_accounts")
    .select("id")
    .eq("player_email", normalized)
    .maybeSingle();

  if (!account?.id) return null;

  const { data: recentDeposit } = await supabase
    .from("square_bank_ledger")
    .select("id, amount_cents, created_at")
    .eq("account_id", account.id)
    .eq("entry_type", "deposit")
    .eq("direction", "credit")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!recentDeposit) return null;

  return {
    ledgerId: recentDeposit.id as string,
    amountCents: Number(recentDeposit.amount_cents),
    depositedAt: recentDeposit.created_at as string,
  };
}

export async function recordWithdrawalReviewHold(input: {
  email: string;
  walletId: string;
  holdReason: WithdrawalHoldReason;
  withdrawalLedgerId: string;
  withdrawalAmountCents: number;
  holdUntil: Date;
  depositLedgerId?: string;
  depositAt?: string;
  depositAmountCents?: number;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("withdrawal_review_holds")
    .insert({
      player_email: normalizeEmail(input.email),
      wallet_id: input.walletId,
      hold_reason: input.holdReason,
      deposit_ledger_id: input.depositLedgerId ?? null,
      deposit_at: input.depositAt ?? null,
      deposit_amount_cents: input.depositAmountCents ?? null,
      withdrawal_ledger_id: input.withdrawalLedgerId,
      withdrawal_amount_cents: input.withdrawalAmountCents,
      hold_until: input.holdUntil.toISOString(),
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function countPendingWithdrawalHolds(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("withdrawal_review_holds")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");

  return count ?? 0;
}
