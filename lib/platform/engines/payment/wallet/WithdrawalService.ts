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
import {
  evaluateWithdrawalReview,
  recordWithdrawalReviewHold,
} from "./WithdrawalHoldService";
import { requiresWithdrawalReview as bankRequiresReview } from "@/lib/platform/engines/squareBank/ComplianceService";
import type { WithdrawalRequestResult } from "./types";

/** ComplianceEngine hook — large-withdrawal threshold only (sync). */
export function requiresWithdrawalReview(amountCents: number): boolean {
  return bankRequiresReview(amountCents);
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

  const review = await evaluateWithdrawalReview({
    email: input.email,
    amountCents,
    largeWithdrawalThresholdCents: LARGE_WITHDRAWAL_REVIEW_CENTS,
  });
  const pendingReview = review.requiresReview;
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
    metadata: {
      pendingReview,
      reviewReason: review.reason ?? null,
      holdUntil: review.holdUntil?.toISOString() ?? null,
    },
  });

  await creditBalance({
    email: input.email,
    walletId: wallet.id,
    balanceType: "pending_withdrawals",
    amountCents,
    entryType: "withdrawal_request",
    description: "Pending withdrawal",
    metadata: {
      pendingReview,
      reviewReason: review.reason ?? null,
      debitLedgerId: debitEntry.id,
    },
  });

  if (pendingReview) {
    const holdUntil =
      review.holdUntil ??
      new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (review.reason) {
      await recordWithdrawalReviewHold({
        email: input.email,
        walletId: wallet.id,
        holdReason: review.reason,
        withdrawalLedgerId: debitEntry.id,
        withdrawalAmountCents: amountCents,
        holdUntil,
        depositLedgerId: review.recentDeposit?.ledgerId,
        depositAt: review.recentDeposit?.depositedAt,
        depositAmountCents: review.recentDeposit?.amountCents,
        metadata: { reviewReason: review.reason },
      });
    }

    const auditDetail =
      review.reason === "rapid_deposit_withdraw"
        ? `Rapid deposit→withdraw hold — $${(amountCents / 100).toFixed(2)} (review until ${holdUntil.toISOString()})`
        : `Large withdrawal review — $${(amountCents / 100).toFixed(2)}`;

    await recordPaymentTransaction({
      playerEmail: input.email,
      provider: getPaymentProviderId(),
      walletType: "pending",
      transactionType: "withdrawal",
      amountCents,
      status: "pending",
      idempotencyKey,
      auditAction:
        review.reason === "rapid_deposit_withdraw"
          ? "withdrawal_hold_rapid_deposit"
          : "withdrawal_review_required",
      auditDetail,
    });
    return {
      ok: true,
      pendingReview: true,
      reviewReason: review.reason,
      holdUntil: holdUntil.toISOString(),
      ledgerEntryId: debitEntry.id,
    };
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
