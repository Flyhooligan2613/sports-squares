import { getPlayerWallet, formatSavedPaymentLabel } from "@/lib/platform/engines/payment/adapters/stripe/playerWallet";
import { listPaymentTransactionsForPlayer } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import type {
  SquareWalletSummary,
  SquareWalletTransaction,
} from "@/lib/platform/engines/payment/types";
import { normalizeEmail } from "@/lib/player/statsCore";

/** SquareWallet™ — platform-owned wallet experience layer. */
export async function getSquareWallet(email: string): Promise<SquareWalletSummary> {
  const normalized = normalizeEmail(email);
  const wallet = await getPlayerWallet(normalized);

  return {
    email: normalized,
    providerCustomerId: wallet.stripeCustomerId,
    defaultPaymentMethodId: wallet.defaultPaymentMethodId,
    paymentMethodBrand: wallet.brand,
    paymentMethodLast4: wallet.last4,
    fastCheckoutAvailable: wallet.fastCheckoutAvailable,
    accountSuspended: wallet.accountSuspended,
    availableBalanceCents: 0,
    pendingBalanceCents: 0,
  };
}

export function formatSquareWalletPaymentLabel(wallet: SquareWalletSummary): string | null {
  if (!wallet.paymentMethodLast4) return null;
  const brand = wallet.paymentMethodBrand
    ? wallet.paymentMethodBrand.charAt(0).toUpperCase() + wallet.paymentMethodBrand.slice(1)
    : "Card";
  return `${brand} ···· ${wallet.paymentMethodLast4}`;
}

/** Backward-compatible alias for existing wallet UI. */
export function formatSavedPaymentLabelFromSquareWallet(
  wallet: SquareWalletSummary
): string | null {
  return formatSquareWalletPaymentLabel(wallet);
}

export async function getSquareWalletTransactionHistory(
  email: string,
  limit = 50
): Promise<SquareWalletTransaction[]> {
  const records = await listPaymentTransactionsForPlayer(email, limit);
  return records.map((r) => ({
    id: r.id,
    type: r.transactionType,
    status: r.status,
    amountCents: r.amountCents,
    feesCents: r.feesCents,
    currency: r.currency,
    description: r.auditLog[0]?.detail ?? null,
    contestId: r.contestId,
    poolId: r.poolId,
    provider: r.provider,
    createdAt: r.createdAt,
  }));
}

export function getSquareWalletProvider(): string {
  return getPaymentProviderId();
}

/** Map legacy PlayerWalletSummary shape for existing components. */
export async function getLegacyPlayerWalletSummary(email: string) {
  const sq = await getSquareWallet(email);
  return {
    stripeCustomerId: sq.providerCustomerId,
    defaultPaymentMethodId: sq.defaultPaymentMethodId,
    brand: sq.paymentMethodBrand,
    last4: sq.paymentMethodLast4,
    fastCheckoutAvailable: sq.fastCheckoutAvailable,
    accountSuspended: sq.accountSuspended,
    label: formatSavedPaymentLabel({
      stripeCustomerId: sq.providerCustomerId,
      defaultPaymentMethodId: sq.defaultPaymentMethodId,
      brand: sq.paymentMethodBrand,
      last4: sq.paymentMethodLast4,
      fastCheckoutAvailable: sq.fastCheckoutAvailable,
      accountSuspended: sq.accountSuspended,
    }),
  };
}
