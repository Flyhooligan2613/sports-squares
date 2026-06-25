import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";
import type { WalletTransactionStatus } from "@/lib/platform/language/walletLanguage";

export function formatWalletCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatWalletDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatWalletType(entry: SquareWalletLedgerEntry): string {
  const labels: Record<string, string> = {
    deposit: "Deposit",
    withdrawal_request: "Withdrawal",
    withdrawal_complete: "Withdrawal",
    contest_entry: "Contest Entry",
    winnings_credit: "Contest Win",
    winnings_release: "Winnings Release",
    reward_credit: "Reward",
    bonus_credit: "Bonus Credit",
    promotional_credit: "Promotional",
    referral_credit: "Referral",
    adjustment: "Adjustment",
    refund: "Refund",
  };
  return labels[entry.entryType] ?? entry.entryType.replace(/_/g, " ");
}

export function resolveTransactionStatus(entry: SquareWalletLedgerEntry): WalletTransactionStatus {
  const meta = entry.metadata ?? {};

  if (entry.entryType === "refund") return "refunded";
  if (meta.cancelled === true || meta.status === "cancelled") return "cancelled";
  if (meta.status === "failed" || meta.failed === true) return "failed";

  if (entry.entryType === "withdrawal_request") {
    if (meta.pendingReview === true) return "processing";
    return "pending";
  }

  if (entry.entryType === "withdrawal_complete") return "completed";

  if (entry.entryType === "deposit") {
    if (meta.status === "pending") return "pending";
    return "completed";
  }

  if (meta.status === "pending" || meta.pending === true) return "pending";
  if (meta.status === "processing") return "processing";

  return "completed";
}

export function statusBadgeVariant(
  status: WalletTransactionStatus
): "paid" | "processing" | "upcoming" | "final-minutes" | "info" {
  switch (status) {
    case "completed":
      return "paid";
    case "processing":
      return "processing";
    case "pending":
      return "upcoming";
    case "failed":
    case "cancelled":
      return "final-minutes";
    case "refunded":
      return "info";
    default:
      return "info";
  }
}

export function resolvePaymentMethod(entry: SquareWalletLedgerEntry): string | null {
  const meta = entry.metadata ?? {};
  const brand = typeof meta.cardBrand === "string" ? meta.cardBrand : typeof meta.brand === "string" ? meta.brand : null;
  const last4 = typeof meta.last4 === "string" ? meta.last4 : null;
  if (brand && last4) return `${brand} •••• ${last4}`;
  if (last4) return `Card •••• ${last4}`;
  if (entry.entryType === "deposit" || entry.entryType === "withdrawal_request" || entry.entryType === "withdrawal_complete") {
    return "SquareWallet™";
  }
  return null;
}

export function resolveReferenceId(entry: SquareWalletLedgerEntry): string {
  return (
    entry.paymentTransactionId ??
    entry.referenceId ??
    entry.id.slice(0, 8).toUpperCase()
  );
}

export function resolveTransactionFee(entry: SquareWalletLedgerEntry): number {
  const meta = entry.metadata ?? {};
  const fee = meta.feeCents ?? meta.fee_cents;
  return typeof fee === "number" ? fee : 0;
}
