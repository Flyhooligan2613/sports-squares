/** SquareBank™ — financial source of truth types (not customer-facing). */

export type SquareBankAccountStatus = "active" | "suspended" | "closed" | "fraud_hold";

export type SquareBankKycStatus = "none" | "pending" | "verified" | "rejected";

export type SquareBankAccountType =
  | "available_cash"
  | "pending_cash"
  | "contest_credits"
  | "bonus_credits"
  | "reward_credits"
  | "referral_credits"
  | "promotional_credits"
  | "locked_funds"
  | "reserved_funds"
  | "marketplace_credits";

export type SquareBankDirection = "credit" | "debit";

export type SquareBankLedgerEntryType =
  | "deposit"
  | "contest_entry"
  | "contest_refund"
  | "contest_cancellation"
  | "contest_prize"
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_completed"
  | "bonus_credit"
  | "squarepass_reward"
  | "referral_reward"
  | "reward_drop"
  | "manual_adjustment"
  | "admin_adjustment"
  | "chargeback"
  | "reversal"
  | "fraud_hold"
  | "tax_adjustment"
  | "winnings_release"
  | "transfer";

export type SquareBankReconciliationPeriod = "daily" | "weekly" | "monthly";

export type SquareBankDisputeStatus = "open" | "investigating" | "resolved" | "closed";

export interface SquareBankAccountRecord {
  id: string;
  playerEmail: string;
  walletId: string | null;
  status: SquareBankAccountStatus;
  lifetimeDepositsCents: number;
  lifetimeWithdrawalsCents: number;
  lifetimeContestEntriesCents: number;
  lifetimeWinningsCents: number;
  kycStatus: SquareBankKycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SquareBankBalanceRow {
  accountType: SquareBankAccountType;
  amountCents: number;
  updatedAt: string;
}

export interface SquareBankBalances {
  availableCash: number;
  pendingCash: number;
  contestCredits: number;
  bonusCredits: number;
  rewardCredits: number;
  referralCredits: number;
  promotionalCredits: number;
  lockedFunds: number;
  reservedFunds: number;
  marketplaceCredits: number;
}

export interface SquareBankLedgerEntry {
  id: string;
  accountId: string;
  playerEmail: string;
  accountType: SquareBankAccountType;
  direction: SquareBankDirection;
  amountCents: number;
  runningBalanceCents: number | null;
  entryType: SquareBankLedgerEntryType;
  referenceType: string | null;
  referenceId: string | null;
  paymentTransactionId: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  module: string | null;
  adminEmail: string | null;
  createdAt: string;
}

export interface SquareBankAuditEntry {
  id: string;
  ledgerEntryId: string;
  playerEmail: string;
  action: string;
  amountCents: number;
  balanceBeforeCents: number;
  balanceAfterCents: number;
  accountType: SquareBankAccountType;
  referenceType: string | null;
  referenceId: string | null;
  module: string | null;
  adminEmail: string | null;
  deviceKey: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface SquareBankPostEntryInput {
  email: string;
  accountType: SquareBankAccountType;
  direction: SquareBankDirection;
  amountCents: number;
  entryType: SquareBankLedgerEntryType;
  referenceType?: string | null;
  referenceId?: string | null;
  paymentTransactionId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  module?: string;
  adminEmail?: string;
  lifetimeField?: keyof Pick<
    SquareBankAccountRecord,
    | "lifetimeDepositsCents"
    | "lifetimeWithdrawalsCents"
    | "lifetimeContestEntriesCents"
    | "lifetimeWinningsCents"
  >;
  audit?: {
    deviceKey?: string;
    ipAddress?: string;
  };
}

export interface SquareBankHealthMetrics {
  totalAccounts: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
  totalPendingCents: number;
  avgAvailableCashCents: number;
  dailyVolumeCents: number;
  monthlyVolumeCents: number;
  failedPaymentsCount: number;
  chargebacksCount: number;
  refundsCount: number;
  contestFeesCents: number;
}

export interface SquareBankReconciliationResult {
  runId: string;
  period: SquareBankReconciliationPeriod;
  status: "completed" | "failed";
  mismatchCount: number;
  mismatchDetails: Array<{ source: string; expectedCents: number; actualCents: number; note: string }>;
}

export interface SquareBankDisputeRecord {
  id: string;
  ledgerEntryId: string | null;
  playerEmail: string;
  status: SquareBankDisputeStatus;
  disputeType: string;
  amountCents: number;
  contestId: string | null;
  paymentTransactionId: string | null;
  timeline: Array<{ at: string; action: string; actor?: string; note?: string }>;
  resolutionNotes: string | null;
  assignedAdminEmail: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
