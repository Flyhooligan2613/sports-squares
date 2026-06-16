import type { LedgerEntryType } from "./types";

/** Player-facing history filters mapped to SquareBank / wallet ledger entry types. */
export type WalletHistoryCategory =
  | "all"
  | "deposits"
  | "withdrawals"
  | "contest_bets"
  | "wins"
  | "losses";

export type WalletTransactionTypeFilter =
  | "deposit"
  | "withdrawal"
  | "contest_entry"
  | "contest_prize"
  | "refund"
  | "reward"
  | "bonus"
  | "promotional"
  | "referral"
  | "adjustment";

const TYPE_FILTER_MAP: Record<WalletTransactionTypeFilter, LedgerEntryType[]> = {
  deposit: ["deposit"],
  withdrawal: ["withdrawal_request", "withdrawal_complete"],
  contest_entry: ["contest_entry"],
  contest_prize: ["winnings_credit", "winnings_release"],
  refund: ["refund"],
  reward: ["reward_credit"],
  bonus: ["bonus_credit"],
  promotional: ["promotional_credit"],
  referral: ["referral_credit"],
  adjustment: ["adjustment"],
};

const CATEGORY_ENTRY_TYPES: Record<
  Exclude<WalletHistoryCategory, "all" | "losses">,
  LedgerEntryType[]
> = {
  deposits: ["deposit"],
  withdrawals: ["withdrawal_request", "withdrawal_complete"],
  contest_bets: ["contest_entry"],
  wins: ["winnings_credit", "winnings_release"],
};

export function resolveLedgerEntryTypes(input: {
  category?: WalletHistoryCategory | null;
  type?: WalletTransactionTypeFilter | null;
}): LedgerEntryType[] | null {
  if (input.type) {
    return TYPE_FILTER_MAP[input.type] ?? null;
  }
  if (!input.category || input.category === "all" || input.category === "losses") {
    return null;
  }
  return CATEGORY_ENTRY_TYPES[input.category];
}

export function isLossCategory(category?: WalletHistoryCategory | null): boolean {
  return category === "losses";
}

export function winReferenceKey(
  referenceType: string | null,
  referenceId: string | null
): string | null {
  if (!referenceType || !referenceId) return null;
  return `${referenceType}:${referenceId}`;
}

export function filterLossEntries<
  T extends {
    entryType: LedgerEntryType;
    direction: string;
    referenceType: string | null;
    referenceId: string | null;
  }
>(entries: T[], winEntries: T[]): T[] {
  const winKeys = new Set<string>();
  for (const win of winEntries) {
    const key = winReferenceKey(win.referenceType, win.referenceId);
    if (key) winKeys.add(key);
  }

  return entries.filter((entry) => {
    if (entry.entryType !== "contest_entry" || entry.direction !== "debit") return false;
    const key = winReferenceKey(entry.referenceType, entry.referenceId);
    if (!key) return true;
    return !winKeys.has(key);
  });
}

export const WALLET_HISTORY_TABS: Array<{
  id: WalletHistoryCategory;
  label: string;
  emptyTitle: string;
  emptyBody: string;
}> = [
  {
    id: "deposits",
    label: "Deposits",
    emptyTitle: "No deposits yet",
    emptyBody: "Add funds to SquareWallet™ to join contests faster.",
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    emptyTitle: "No withdrawals yet",
    emptyBody: "When you cash out winnings, they'll appear here.",
  },
  {
    id: "contest_bets",
    label: "Contest Entries",
    emptyTitle: "No contest entries yet",
    emptyBody: "Your contest funding history will show up here after you join.",
  },
  {
    id: "wins",
    label: "Wins",
    emptyTitle: "No contest wins yet",
    emptyBody: "Land a win and your prize credits will appear here.",
  },
  {
    id: "losses",
    label: "Losses",
    emptyTitle: "No settled losses yet",
    emptyBody: "Entries in contests you didn't win will appear here.",
  },
];
