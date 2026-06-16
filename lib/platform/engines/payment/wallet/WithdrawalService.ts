import { PaymentEngine } from "@/lib/platform/engines/payment";
import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import { getConnectAccountIdForEmail } from "@/lib/database/services/stripeConnect";
import { normalizeEmail } from "@/lib/player/statsCore";
import { LARGE_WITHDRAWAL_REVIEW_CENTS, MIN_WITHDRAWAL_CENTS } from "./config";
import {
  computeWithdrawableCents,
  creditBalance,
  debitBalance,
  getWalletBalances,
} from "./WalletLedgerService";
import { ensureSquareWallet } from "./WalletLifecycleService";
import type { WithdrawalRequestResult } from "./types";

/** ComplianceEngine hook placeholder — large withdrawals flagged for review. */
export function requiresWithdrawalReview(amountCents: number): boolean {
  return amountCents >= LARGE_WITHDRAWAL_REVIEW_CENTS;
}

export async function requestWithdrawal(input: {
  email: string;
  amountCents: number;
  poolId?: string;
}): Promise<WithdrawalRequestResult> {
  const amountCents = Math.floor(input.amountCents);
  if (amountCents < MIN_WITHDRAWAL_CENTS) {
    return {
      ok: false,
      error: `Minimum withdrawal is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}.`,
    };
  }

  const wallet = await ensureSquareWallet(input.email);
  if (wallet.status !== "active") {
    return { ok: false, error: "Your SquareWallet is not active." };
  }

  const { balances } = await getWalletBalances(input.email);
  const withdrawable = computeWithdrawableCents(balances);
  if (amountCents > withdrawable) {
    return { ok: false, error: "Insufficient available balance." };
  }

  const pendingReview = requiresWithdrawalReview(amountCents);
  const idempotencyKey = `withdraw_${wallet.id}_${Date.now()}_${amountCents}`;

  const debitEntry = await debitBalance({
    email: input.email,
    walletId: wallet.id,
    balanceType: "available",
    amountCents,
    entryType: "withdrawal_request",
    description: pendingReview
      ? "Withdrawal pending compliance review"
      : "Withdrawal to linked cash-out account",
    metadata: { pendingReview },
  });

  await creditBalance({
    email: input.email,
    walletId: wallet.id,
    balanceType: "pending_withdrawals",
    amountCents,
    entryType: "withdrawal_request",
    description: "Pending withdrawal",
    metadata: { pendingReview, debitLedgerId: debitEntry.id },
  });

  if (pendingReview) {
    await recordPaymentTransaction({
      playerEmail: input.email,
      provider: getPaymentProviderId(),
      walletType: "pending",
      transactionType: "withdrawal",
      amountCents,
      status: "pending",
      idempotencyKey,
      auditAction: "withdrawal_review_required",
      auditDetail: `Large withdrawal review — $${(amountCents / 100).toFixed(2)}`,
    });
    return { ok: true, pendingReview: true, ledgerEntryId: debitEntry.id };
  }

  return processWithdrawalPayout({
    email: input.email,
    walletId: wallet.id,
    amountCents,
    idempotencyKey,
    ledgerEntryId: debitEntry.id,
    poolId: input.poolId,
  });
}

async function processWithdrawalPayout(input: {
  email: string;
  walletId: string;
  amountCents: number;
  idempotencyKey: string;
  ledgerEntryId: string;
  poolId?: string;
}): Promise<WithdrawalRequestResult> {
  if (!PaymentEngine.isConnectEnabled()) {
    return {
      ok: false,
      error: "Cash-out is not enabled. Connect your SquareWallet cash-out account first.",
    };
  }

  const connectAccountId = await getConnectAccountIdForEmail(normalizeEmail(input.email));
  if (!connectAccountId) {
    return {
      ok: false,
      error: "Connect your SquareWallet cash-out account before withdrawing.",
    };
  }

  const payout = await PaymentEngine.createPayout({
    email: normalizeEmail(input.email),
    amountCents: input.amountCents,
    destinationAccountId: connectAccountId,
    idempotencyKey: input.idempotencyKey,
    metadata: { ledgerEntryId: input.ledgerEntryId, source: "square_wallet_withdrawal" },
  });

  const tx = await recordPaymentTransaction({
    playerEmail: input.email,
    provider: getPaymentProviderId(),
    providerTransactionId: payout.providerTransactionId,
    walletType: "available",
    transactionType: "withdrawal",
    amountCents: input.amountCents,
    status: payout.ok ? "completed" : "failed",
    idempotencyKey: input.idempotencyKey,
    auditAction: "square_wallet_withdrawal",
    auditDetail: payout.ok ? "Withdrawal sent to cash-out account" : payout.error?.message,
  });

  if (!payout.ok) {
    return { ok: false, error: payout.error?.userMessage ?? "Withdrawal failed.", paymentTransactionId: tx.id };
  }

  await debitBalance({
    email: input.email,
    walletId: input.walletId,
    balanceType: "pending_withdrawals",
    amountCents: input.amountCents,
    entryType: "withdrawal_complete",
    paymentTransactionId: tx.id,
    description: "Withdrawal completed",
    lifetimeField: "lifetimeWithdrawalsCents",
  });

  return { ok: true, ledgerEntryId: input.ledgerEntryId, paymentTransactionId: tx.id };
}

export async function listPendingWithdrawals(email: string) {
  const { balances } = await getWalletBalances(email);
  return { pendingCents: balances.pendingWithdrawals };
}
