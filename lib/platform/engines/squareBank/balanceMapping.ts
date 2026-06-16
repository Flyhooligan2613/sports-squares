import type { SquareWalletBalanceType } from "@/lib/platform/engines/payment/wallet/types";
import type { SquareBankAccountType, SquareBankBalances } from "./types";

/** Map SquareBank account types to SquareWallet presentation balance types. */
export const BANK_TO_WALLET_BALANCE: Record<
  SquareBankAccountType,
  SquareWalletBalanceType | null
> = {
  available_cash: "available",
  pending_cash: "pending_winnings",
  reserved_funds: "pending_withdrawals",
  contest_credits: "contest_credits",
  bonus_credits: "bonus_credits",
  reward_credits: "reward_credits",
  promotional_credits: "promotional",
  referral_credits: "referral",
  locked_funds: null,
  marketplace_credits: null,
};

export const WALLET_TO_BANK_BALANCE: Record<SquareWalletBalanceType, SquareBankAccountType> = {
  available: "available_cash",
  pending_winnings: "pending_cash",
  pending_withdrawals: "reserved_funds",
  contest_credits: "contest_credits",
  bonus_credits: "bonus_credits",
  reward_credits: "reward_credits",
  promotional: "promotional_credits",
  referral: "referral_credits",
};

export function emptyBankBalances(): SquareBankBalances {
  return {
    availableCash: 0,
    pendingCash: 0,
    contestCredits: 0,
    bonusCredits: 0,
    rewardCredits: 0,
    referralCredits: 0,
    promotionalCredits: 0,
    lockedFunds: 0,
    reservedFunds: 0,
    marketplaceCredits: 0,
  };
}

export function bankBalancesFromRows(
  rows: Array<{ accountType: SquareBankAccountType; amountCents: number }>
): SquareBankBalances {
  const b = emptyBankBalances();
  for (const row of rows) {
    switch (row.accountType) {
      case "available_cash":
        b.availableCash = row.amountCents;
        break;
      case "pending_cash":
        b.pendingCash = row.amountCents;
        break;
      case "contest_credits":
        b.contestCredits = row.amountCents;
        break;
      case "bonus_credits":
        b.bonusCredits = row.amountCents;
        break;
      case "reward_credits":
        b.rewardCredits = row.amountCents;
        break;
      case "referral_credits":
        b.referralCredits = row.amountCents;
        break;
      case "promotional_credits":
        b.promotionalCredits = row.amountCents;
        break;
      case "locked_funds":
        b.lockedFunds = row.amountCents;
        break;
      case "reserved_funds":
        b.reservedFunds = row.amountCents;
        break;
      case "marketplace_credits":
        b.marketplaceCredits = row.amountCents;
        break;
      default:
        break;
    }
  }
  return b;
}

export function computeBankSpendableCents(balances: SquareBankBalances): number {
  return (
    balances.availableCash +
    balances.contestCredits +
    balances.bonusCredits +
    balances.rewardCredits +
    balances.promotionalCredits +
    balances.referralCredits
  );
}

export function computeBankWithdrawableCents(balances: SquareBankBalances): number {
  return Math.max(0, balances.availableCash);
}
