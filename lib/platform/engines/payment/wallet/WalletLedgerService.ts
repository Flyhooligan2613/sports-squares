import { SquareBankEngine } from "@/lib/platform/engines/squareBank";
import { WALLET_TO_BANK_BALANCE } from "@/lib/platform/engines/squareBank/balanceMapping";
import type { SquareBankLedgerEntryType } from "@/lib/platform/engines/squareBank/types";
import {
  balancesFromRows,
  emptyBalances,
  fetchBalanceRows,
  findWalletByEmail,
} from "./repository";
import type { LedgerEntryType, SquareWalletBalanceType, SquareWalletLedgerEntry } from "./types";

const WALLET_TO_BANK_ENTRY: Partial<Record<LedgerEntryType, SquareBankLedgerEntryType>> = {
  deposit: "deposit",
  contest_entry: "contest_entry",
  winnings_credit: "contest_prize",
  winnings_release: "winnings_release",
  withdrawal_request: "withdrawal_request",
  withdrawal_complete: "withdrawal_completed",
  reward_credit: "reward_drop",
  bonus_credit: "bonus_credit",
  promotional_credit: "bonus_credit",
  referral_credit: "referral_reward",
  adjustment: "manual_adjustment",
  refund: "contest_refund",
};

function mapBankEntryToWallet(entry: {
  id: string;
  accountId: string;
  playerEmail: string;
  accountType: string;
  direction: "credit" | "debit";
  amountCents: number;
  runningBalanceCents: number | null;
  entryType: string;
  referenceType: string | null;
  referenceId: string | null;
  paymentTransactionId: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}, walletId: string): SquareWalletLedgerEntry {
  const bankToWalletType: Record<string, SquareWalletBalanceType> = {
    available_cash: "available",
    pending_cash: "pending_winnings",
    reserved_funds: "pending_withdrawals",
    contest_credits: "contest_credits",
    bonus_credits: "bonus_credits",
    reward_credits: "reward_credits",
    promotional_credits: "promotional",
    referral_credits: "referral",
  };

  const walletEntryTypeMap: Record<string, LedgerEntryType> = {
    deposit: "deposit",
    contest_entry: "contest_entry",
    contest_prize: "winnings_credit",
    winnings_release: "winnings_release",
    withdrawal_request: "withdrawal_request",
    withdrawal_completed: "withdrawal_complete",
    reward_drop: "reward_credit",
    squarepass_reward: "reward_credit",
    referral_reward: "referral_credit",
    bonus_credit: "bonus_credit",
    manual_adjustment: "adjustment",
    admin_adjustment: "adjustment",
    contest_refund: "refund",
  };

  return {
    id: entry.id,
    walletId,
    playerEmail: entry.playerEmail,
    balanceType: bankToWalletType[entry.accountType] ?? "available",
    direction: entry.direction,
    amountCents: entry.amountCents,
    runningBalanceCents: entry.runningBalanceCents,
    entryType: walletEntryTypeMap[entry.entryType] ?? "adjustment",
    referenceType: entry.referenceType,
    referenceId: entry.referenceId,
    paymentTransactionId: entry.paymentTransactionId,
    description: entry.description,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
  };
}

export function computeWithdrawableCents(
  balances: import("./types").SquareWalletBalances
): number {
  return Math.max(0, balances.available);
}

export function computeTotalSpendableCents(
  balances: import("./types").SquareWalletBalances
): number {
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
  balances: import("./types").SquareWalletBalances;
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
  lifetimeField?: keyof Pick<
    import("./types").SquareWalletRecord,
    | "lifetimeDepositsCents"
    | "lifetimeWithdrawalsCents"
    | "lifetimeContestEntriesCents"
    | "lifetimeWinningsCents"
  >;
}): Promise<SquareWalletLedgerEntry> {
  const bankEntryType = WALLET_TO_BANK_ENTRY[input.entryType] ?? "manual_adjustment";
  const entry = await SquareBankEngine.postEntry({
    email: input.email,
    accountType: WALLET_TO_BANK_BALANCE[input.balanceType],
    direction: "credit",
    amountCents: input.amountCents,
    entryType: bankEntryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    lifetimeField: input.lifetimeField,
    module: "square_wallet",
  });
  return mapBankEntryToWallet(entry, input.walletId);
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
  lifetimeField?: keyof Pick<
    import("./types").SquareWalletRecord,
    | "lifetimeDepositsCents"
    | "lifetimeWithdrawalsCents"
    | "lifetimeContestEntriesCents"
    | "lifetimeWinningsCents"
  >;
}): Promise<SquareWalletLedgerEntry> {
  const bankEntryType = WALLET_TO_BANK_ENTRY[input.entryType] ?? "manual_adjustment";
  const entry = await SquareBankEngine.postEntry({
    email: input.email,
    accountType: WALLET_TO_BANK_BALANCE[input.balanceType],
    direction: "debit",
    amountCents: input.amountCents,
    entryType: bankEntryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    lifetimeField: input.lifetimeField,
    module: "square_wallet",
  });
  return mapBankEntryToWallet(entry, input.walletId);
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
  const bankEntryType = WALLET_TO_BANK_ENTRY[input.entryType] ?? "transfer";
  const result = await SquareBankEngine.postTransfer({
    email: input.email,
    from: WALLET_TO_BANK_BALANCE[input.from],
    to: WALLET_TO_BANK_BALANCE[input.to],
    amountCents: input.amountCents,
    entryType: bankEntryType,
    description: input.description,
  });
  return {
    debit: mapBankEntryToWallet(result.debit, input.walletId),
    credit: mapBankEntryToWallet(result.credit, input.walletId),
  };
}
