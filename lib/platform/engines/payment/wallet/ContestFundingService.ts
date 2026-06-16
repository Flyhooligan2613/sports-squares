import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import { CONTEST_FUNDING_PRIORITY } from "./config";
import {
  computeTotalSpendableCents,
  debitBalance,
  getWalletBalances,
} from "./WalletLedgerService";
import { ensureSquareWallet } from "./WalletLifecycleService";
import { findWalletByEmail } from "./repository";
import type { ContestFundingResult } from "./types";
import type { SquareWalletBalanceType } from "./types";

const BALANCE_FIELD_MAP: Record<SquareWalletBalanceType, keyof import("./types").SquareWalletBalances> = {
  available: "available",
  pending_winnings: "pendingWinnings",
  pending_withdrawals: "pendingWithdrawals",
  contest_credits: "contestCredits",
  bonus_credits: "bonusCredits",
  reward_credits: "rewardCredits",
  promotional: "promotional",
  referral: "referral",
};

/** Deduct contest entry from wallet balances per credit-type rules. */
export async function chargeForEntry(input: {
  email: string;
  amountCents: number;
  contestId?: string | null;
  poolId?: string | null;
  description: string;
  idempotencyKey?: string;
}): Promise<ContestFundingResult> {
  const amountCents = Math.floor(input.amountCents);
  if (amountCents <= 0) {
    return { ok: true, ledgerEntryIds: [] };
  }

  const wallet = await ensureSquareWallet(input.email);
  if (wallet.status !== "active") {
    return { ok: false, error: "SquareWallet is not active." };
  }

  const { walletId, balances } = await getWalletBalances(input.email);
  if (!walletId) {
    return { ok: false, insufficient: true, shortfallCents: amountCents };
  }

  const spendable = computeTotalSpendableCents(balances);
  if (spendable < amountCents) {
    return { ok: false, insufficient: true, shortfallCents: amountCents - spendable };
  }

  let remaining = amountCents;
  const ledgerEntryIds: string[] = [];

  for (const balanceType of CONTEST_FUNDING_PRIORITY) {
    if (remaining <= 0) break;
    const key = BALANCE_FIELD_MAP[balanceType];
    const available = balances[key];
    if (available <= 0) continue;

    const slice = Math.min(available, remaining);
    const entry = await debitBalance({
      email: input.email,
      walletId,
      balanceType,
      amountCents: slice,
      entryType: "contest_entry",
      referenceType: input.poolId ? "pool" : "contest",
      referenceId: input.poolId ?? input.contestId ?? null,
      description: input.description,
    });
    ledgerEntryIds.push(entry.id);
    remaining -= slice;
    balances[key] = available - slice;
  }

  const tx = await recordPaymentTransaction({
    playerEmail: input.email,
    contestId: input.contestId ?? null,
    poolId: input.poolId ?? null,
    provider: getPaymentProviderId(),
    walletType: "available",
    transactionType: "contest_entry",
    amountCents,
    status: "completed",
    idempotencyKey: input.idempotencyKey ?? `wallet_entry_${ledgerEntryIds.join("_")}`,
    auditAction: "square_wallet_contest_entry",
    auditDetail: input.description,
  });

  if (walletId) {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const wallet = await findWalletByEmail(input.email);
    if (wallet) {
      await getSupabaseAdmin()
        .from("square_wallets")
        .update({
          lifetime_contest_entries_cents: wallet.lifetimeContestEntriesCents + amountCents,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);
    }
  }

  return { ok: true, ledgerEntryIds, paymentTransactionId: tx.id };
}

export async function canAffordEntry(email: string, amountCents: number): Promise<{
  canAfford: boolean;
  spendableCents: number;
  shortfallCents: number;
}> {
  const { balances } = await getWalletBalances(email);
  const spendable = computeTotalSpendableCents(balances);
  return {
    canAfford: spendable >= amountCents,
    spendableCents: spendable,
    shortfallCents: Math.max(0, amountCents - spendable),
  };
}
