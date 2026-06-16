import type { SquareBankAccountType, SquareBankLedgerEntryType } from "./types";

/** All account types initialized to zero on account creation. */
export const ALL_SQUARE_BANK_ACCOUNT_TYPES: SquareBankAccountType[] = [
  "available_cash",
  "pending_cash",
  "contest_credits",
  "bonus_credits",
  "reward_credits",
  "referral_credits",
  "promotional_credits",
  "locked_funds",
  "reserved_funds",
  "marketplace_credits",
];

/** Contest entry deduction priority — promotional first, cash last. */
export const SQUARE_BANK_CONTEST_FUNDING_PRIORITY: SquareBankAccountType[] = [
  "promotional_credits",
  "referral_credits",
  "reward_credits",
  "bonus_credits",
  "contest_credits",
  "available_cash",
];

export const LARGE_WITHDRAWAL_REVIEW_CENTS = Number(
  process.env.SQUARE_BANK_LARGE_WITHDRAWAL_CENTS ??
    process.env.SQUARE_WALLET_LARGE_WITHDRAWAL_CENTS ??
    "50000"
);

export const MIN_DEPOSIT_CENTS = Number(
  process.env.SQUARE_BANK_MIN_DEPOSIT_CENTS ?? process.env.SQUARE_WALLET_MIN_DEPOSIT_CENTS ?? "500"
);

export const MIN_WITHDRAWAL_CENTS = Number(
  process.env.SQUARE_BANK_MIN_WITHDRAWAL_CENTS ??
    process.env.SQUARE_WALLET_MIN_WITHDRAWAL_CENTS ??
    "1000"
);

/** Velocity check stub — max daily withdrawal cents per account. */
export const DAILY_WITHDRAWAL_VELOCITY_CENTS = Number(
  process.env.SQUARE_BANK_DAILY_WITHDRAWAL_CENTS ?? "500000"
);

/** Map bank entry types to wallet presentation entry types. */
export const BANK_TO_WALLET_ENTRY_TYPE: Partial<
  Record<SquareBankLedgerEntryType, string>
> = {
  deposit: "deposit",
  contest_entry: "contest_entry",
  contest_refund: "refund",
  contest_cancellation: "refund",
  contest_prize: "winnings_credit",
  withdrawal_request: "withdrawal_request",
  withdrawal_completed: "withdrawal_complete",
  bonus_credit: "bonus_credit",
  squarepass_reward: "reward_credit",
  referral_reward: "referral_credit",
  reward_drop: "reward_credit",
  manual_adjustment: "adjustment",
  admin_adjustment: "adjustment",
  chargeback: "refund",
  reversal: "refund",
  winnings_release: "winnings_release",
};
