import {
  applyLedgerMutation,
  balancesFromRows,
  emptyBalances,
  fetchBalanceRows,
  findWalletByEmail,
} from "./repository";
import type { SquareWalletBalanceType, SquareWalletBalances, SquareWalletLedgerEntry } from "./types";

export function computeWithdrawableCents(balances: SquareWalletBalances): number {
  return Math.max(0, balances.available);
}

export function computeTotalSpendableCents(balances: SquareWalletBalances): number {
  return (
    balances.available +
    balances.contestCredits +
    balances.bonusCredits +
    balances.rewardCredits +
    balances.promotional +
    balances.referral
  );
}

export async function getWalletBalances(email: string): Promise<{
  walletId: string | null;
  balances: SquareWalletBalances;
}> {
  const wallet = await findWalletByEmail(email);
  if (!wallet) {
    return { walletId: null, balances: emptyBalances() };
  }
  const rows = await fetchBalanceRows(wallet.id);
  return { walletId: wallet.id, balances: balancesFromRows(rows) };
}

export async function creditBalance(input: {
  email: string;
  walletId: string;
  balanceType: SquareWalletBalanceType;
  amountCents: number;
  entryType: SquareWalletLedgerEntry["entryType"];
  referenceType?: string | null;
  referenceId?: string | null;
  paymentTransactionId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  lifetimeField?: Parameters<typeof applyLedgerMutation>[0]["lifetimeField"];
}): Promise<SquareWalletLedgerEntry> {
  return applyLedgerMutation({
    walletId: input.walletId,
    playerEmail: input.email,
    balanceType: input.balanceType,
    direction: "credit",
    amountCents: input.amountCents,
    entryType: input.entryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    lifetimeField: input.lifetimeField,
  });
}

export async function debitBalance(input: {
  email: string;
  walletId: string;
  balanceType: SquareWalletBalanceType;
  amountCents: number;
  entryType: SquareWalletLedgerEntry["entryType"];
  referenceType?: string | null;
  referenceId?: string | null;
  paymentTransactionId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  lifetimeField?: Parameters<typeof applyLedgerMutation>[0]["lifetimeField"];
}): Promise<SquareWalletLedgerEntry> {
  return applyLedgerMutation({
    walletId: input.walletId,
    playerEmail: input.email,
    balanceType: input.balanceType,
    direction: "debit",
    amountCents: input.amountCents,
    entryType: input.entryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    lifetimeField: input.lifetimeField,
  });
}

export async function transferBalance(input: {
  email: string;
  walletId: string;
  from: SquareWalletBalanceType;
  to: SquareWalletBalanceType;
  amountCents: number;
  entryType: SquareWalletLedgerEntry["entryType"];
  description?: string;
}): Promise<{ debit: SquareWalletLedgerEntry; credit: SquareWalletLedgerEntry }> {
  const debit = await debitBalance({
    email: input.email,
    walletId: input.walletId,
    balanceType: input.from,
    amountCents: input.amountCents,
    entryType: input.entryType,
    description: input.description ?? `Transfer from ${input.from}`,
  });
  const credit = await creditBalance({
    email: input.email,
    walletId: input.walletId,
    balanceType: input.to,
    amountCents: input.amountCents,
    entryType: input.entryType,
    description: input.description ?? `Transfer to ${input.to}`,
  });
  return { debit, credit };
}
