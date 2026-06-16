import { ensureBankAccount, getBankAccountStatus, suspendBankAccount } from "./AccountService";
import { getAccountBalances, computeBankSpendableCents, computeBankWithdrawableCents } from "./BalanceService";
import { requiresWithdrawalReview } from "./ComplianceService";
import {
  getTransactionDetail,
  getDispute,
  listOpenDisputes,
  openDispute,
  resolveDispute,
} from "./DisputeService";
import { postLedgerEntry, postTransferEntry, WALLET_TO_BANK_BALANCE } from "./LedgerService";
import { getFinancialHealthMetrics, runReconciliation } from "./ReconciliationService";
import { findAccountByEmail, listLedgerEntries } from "./repository";
import type { SquareBankPostEntryInput, SquareBankReconciliationPeriod } from "./types";

/** SquareBankEngine™ — financial source of truth orchestrator (internal/admin). */
export const SquareBankEngine = {
  ensureAccount: ensureBankAccount,
  getAccountStatus: getBankAccountStatus,
  suspendAccount: suspendBankAccount,
  postEntry: postLedgerEntry,
  postTransfer: postTransferEntry,
  getBalances: async (email: string) => {
    const account = await findAccountByEmail(email);
    if (!account) return null;
    const balances = await getAccountBalances(account.id);
    return {
      account,
      balances,
      spendableCents: computeBankSpendableCents(balances),
      withdrawableCents: computeBankWithdrawableCents(balances),
    };
  },
  listEntries: listLedgerEntries,
  runReconciliation: (period?: SquareBankReconciliationPeriod) => runReconciliation(period),
  getHealthMetrics: getFinancialHealthMetrics,
  requiresWithdrawalReview,
  openDispute,
  getDispute,
  listDisputes: listOpenDisputes,
  resolveDispute,
  getTransactionDetail,
  walletToBankType: WALLET_TO_BANK_BALANCE,
};

export type SquareBankEngineType = typeof SquareBankEngine;

export type { SquareBankPostEntryInput };
