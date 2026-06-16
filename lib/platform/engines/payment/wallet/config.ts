import type { SquareWalletBalanceType } from "./types";

/** All balance types initialized to zero on wallet creation. */
export const ALL_SQUARE_WALLET_BALANCE_TYPES: SquareWalletBalanceType[] = [
  "available",
  "pending_winnings",
  "pending_withdrawals",
  "contest_credits",
  "bonus_credits",
  "reward_credits",
  "promotional",
  "referral",
];

/** Contest entry deduction priority — promotional first, cash last. */
export const CONTEST_FUNDING_PRIORITY: SquareWalletBalanceType[] = [
  "promotional",
  "referral",
  "reward_credits",
  "bonus_credits",
  "contest_credits",
  "available",
];

/** Large withdrawal review threshold — ComplianceEngine hook (stub). */
export const LARGE_WITHDRAWAL_REVIEW_CENTS = Number(
  process.env.SQUARE_WALLET_LARGE_WITHDRAWAL_CENTS ?? "50000"
);

export const MIN_DEPOSIT_CENTS = Number(process.env.SQUARE_WALLET_MIN_DEPOSIT_CENTS ?? "500");
export const MIN_WITHDRAWAL_CENTS = Number(process.env.SQUARE_WALLET_MIN_WITHDRAWAL_CENTS ?? "1000");
