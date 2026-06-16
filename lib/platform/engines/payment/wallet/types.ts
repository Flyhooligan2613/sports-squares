/** SquareWallet™ 2.0 — typed balance buckets and ledger shapes. */

export type SquareWalletStatus = "active" | "suspended" | "closed";

export type SquareWalletBalanceType =
  | "available"
  | "pending_winnings"
  | "pending_withdrawals"
  | "contest_credits"
  | "bonus_credits"
  | "reward_credits"
  | "promotional"
  | "referral";

export type LedgerDirection = "credit" | "debit";

export type LedgerEntryType =
  | "deposit"
  | "withdrawal_request"
  | "withdrawal_complete"
  | "contest_entry"
  | "winnings_credit"
  | "winnings_release"
  | "reward_credit"
  | "bonus_credit"
  | "promotional_credit"
  | "referral_credit"
  | "adjustment"
  | "refund";

export interface SquareWalletRecord {
  id: string;
  playerEmail: string;
  status: SquareWalletStatus;
  lifetimeDepositsCents: number;
  lifetimeWithdrawalsCents: number;
  lifetimeContestEntriesCents: number;
  lifetimeWinningsCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface SquareWalletBalanceRow {
  balanceType: SquareWalletBalanceType;
  amountCents: number;
  updatedAt: string;
}

export interface SquareWalletBalances {
  available: number;
  pendingWinnings: number;
  pendingWithdrawals: number;
  contestCredits: number;
  bonusCredits: number;
  rewardCredits: number;
  promotional: number;
  referral: number;
}

export interface SquareWalletLifetimeStats {
  depositsCents: number;
  withdrawalsCents: number;
  contestEntriesCents: number;
  winningsCents: number;
}

export interface SquareWalletLedgerEntry {
  id: string;
  walletId: string;
  playerEmail: string;
  balanceType: SquareWalletBalanceType;
  direction: LedgerDirection;
  amountCents: number;
  runningBalanceCents: number | null;
  entryType: LedgerEntryType;
  referenceType: string | null;
  referenceId: string | null;
  paymentTransactionId: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SquareWalletDashboard {
  wallet: SquareWalletRecord;
  balances: SquareWalletBalances;
  withdrawableCents: number;
  lifetime: SquareWalletLifetimeStats;
  recentTransactions: SquareWalletLedgerEntry[];
  paymentMethod: {
    brand: string | null;
    last4: string | null;
    fastCheckoutAvailable: boolean;
  };
  pendingWin?: {
    amountCents: number;
    contestName: string;
    ledgerId: string;
  } | null;
}

export interface SmartWalletRecommendation {
  id: string;
  kind: "contest_affordance" | "expiring_credits" | "mystery_pass" | "add_funds";
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  priority: number;
}

export interface ContestFundingResult {
  ok: boolean;
  insufficient?: boolean;
  shortfallCents?: number;
  ledgerEntryIds?: string[];
  paymentTransactionId?: string;
  error?: string;
}

export interface WithdrawalRequestResult {
  ok: boolean;
  pendingReview?: boolean;
  ledgerEntryId?: string;
  paymentTransactionId?: string;
  error?: string;
}

export interface WinningsCreditInput {
  email: string;
  amountCents: number;
  contestId?: string | null;
  poolId?: string | null;
  description?: string;
  releaseImmediately?: boolean;
}

export interface TaxYearSummaryStub {
  year: number;
  depositsCents: number;
  withdrawalsCents: number;
  winningsCents: number;
  contestEntriesCents: number;
  exportAvailable: boolean;
}
