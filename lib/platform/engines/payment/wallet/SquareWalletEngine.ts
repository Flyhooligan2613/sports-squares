import { getPlayerWallet } from "@/lib/platform/engines/payment/adapters/stripe/playerWallet";
import { normalizeEmail } from "@/lib/player/statsCore";
import { chargeForEntry, canAffordEntry } from "./ContestFundingService";
import { initiateDeposit, confirmDeposit, syncDepositFromSession, PURCHASE_TYPE_WALLET_DEPOSIT } from "./DepositService";
import { getSmartRecommendations } from "./SmartWalletService";
import { exportTransactionsStub, getYearlySummary } from "./TaxCenterService";
import { ensureSquareWallet, getWalletStatus } from "./WalletLifecycleService";
import {
  computeTotalSpendableCents,
  computeWithdrawableCents,
  getWalletBalances,
} from "./WalletLedgerService";
import { creditWinnings, releasePendingWinnings, buildPostWinPayload } from "./WinningsService";
import { listPendingWithdrawals, requestWithdrawal, requiresWithdrawalReview } from "./WithdrawalService";
import {
  balancesFromRows,
  emptyBalances,
  fetchBalanceRows,
  findWalletByEmail,
  listLedgerEntries,
} from "./repository";
import type { SquareWalletDashboard } from "./types";

/** SquareWalletEngine™ — orchestrator for all wallet operations. */
export const SquareWalletEngine = {
  ensureWallet: ensureSquareWallet,
  getStatus: getWalletStatus,
  getDashboard: getWalletDashboard,
  initiateDeposit,
  confirmDeposit,
  syncDepositFromSession,
  requestWithdrawal,
  listPendingWithdrawals,
  chargeForEntry,
  canAffordEntry,
  creditWinnings,
  releasePendingWinnings,
  buildPostWinPayload,
  getSmartRecommendations,
  getYearlySummary,
  exportTransactions: exportTransactionsStub,
  requiresWithdrawalReview,
  listTransactions: listWalletTransactions,
  PURCHASE_TYPE_WALLET_DEPOSIT,
};

async function getWalletDashboard(email: string): Promise<SquareWalletDashboard | null> {
  const normalized = normalizeEmail(email);
  const wallet = await findWalletByEmail(normalized);

  const [paymentWallet, balancePack] = await Promise.all([
    getPlayerWallet(normalized).catch(() => null),
    wallet
      ? fetchBalanceRows(wallet.id).then(balancesFromRows)
      : Promise.resolve(emptyBalances()),
  ]);

  if (!wallet) {
    return null;
  }

  const balances = balancePack;
  const recentTransactions = await listLedgerEntries({ walletId: wallet.id, limit: 20 });
  const pendingWinEntry = recentTransactions.find(
    (e) =>
      e.entryType === "winnings_credit" &&
      e.direction === "credit" &&
      !(e.metadata as { celebrated?: boolean }).celebrated
  );

  return {
    wallet,
    balances,
    withdrawableCents: computeWithdrawableCents(balances),
    lifetime: {
      depositsCents: wallet.lifetimeDepositsCents,
      withdrawalsCents: wallet.lifetimeWithdrawalsCents,
      contestEntriesCents: wallet.lifetimeContestEntriesCents,
      winningsCents: wallet.lifetimeWinningsCents,
    },
    recentTransactions,
    pendingWin: pendingWinEntry
      ? {
          amountCents: pendingWinEntry.amountCents,
          contestName: pendingWinEntry.description ?? "Contest win",
          ledgerId: pendingWinEntry.id,
        }
      : null,
    paymentMethod: {
      brand: paymentWallet?.brand ?? null,
      last4: paymentWallet?.last4 ?? null,
      fastCheckoutAvailable: paymentWallet?.fastCheckoutAvailable ?? false,
    },
  };
}

async function listWalletTransactions(input: {
  email: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const wallet = await findWalletByEmail(input.email);
  if (!wallet) return { entries: [], total: 0 };
  const entries = await listLedgerEntries({
    walletId: wallet.id,
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
    search: input.search,
  });
  return { entries, total: entries.length };
}

export async function getWalletSummaryForLegacy(email: string) {
  const { balances } = await getWalletBalances(email);
  const dashboard = await getWalletDashboard(email);
  return {
    availableBalanceCents: balances.available,
    pendingBalanceCents: balances.pendingWinnings + balances.pendingWithdrawals,
    spendableCents: computeTotalSpendableCents(balances),
    withdrawableCents: computeWithdrawableCents(balances),
    balances,
    lifetime: dashboard?.lifetime,
  };
}

export type SquareWalletEngineType = typeof SquareWalletEngine;
