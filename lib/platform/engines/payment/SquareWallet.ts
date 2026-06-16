import { getPlayerWallet, formatSavedPaymentLabel } from "@/lib/platform/engines/payment/adapters/stripe/playerWallet";
import { listPaymentTransactionsForPlayer } from "@/lib/platform/engines/payment/TransactionCenter";
import { getWalletSummaryForLegacy } from "@/lib/platform/engines/payment/wallet";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import type {
  PaymentTransactionRecord,
  SquareWalletBalanceBreakdown,
  SquareWalletSummary,
  SquareWalletTransaction,
} from "@/lib/platform/engines/payment/types";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { getInventorySummary } from "@/lib/platform/ecosystem/inventory";

const FUTURE_PLACEHOLDER = null;

function aggregateTransactionBalances(
  transactions: PaymentTransactionRecord[]
): Pick<
  SquareWalletBalanceBreakdown,
  | "pendingBalanceCents"
  | "contestEntriesCents"
  | "depositsCents"
  | "withdrawalsCents"
  | "refundsCents"
  | "rewardCreditsCents"
> {
  let pendingBalanceCents = 0;
  let contestEntriesCents = 0;
  let depositsCents = 0;
  let withdrawalsCents = 0;
  let refundsCents = 0;
  let rewardCreditsCents = 0;

  for (const tx of transactions) {
    const amount = tx.amountCents;
    const isPending = tx.status === "pending" || tx.status === "authorized";

    if (isPending) {
      pendingBalanceCents += amount;
    }

    switch (tx.transactionType) {
      case "contest_entry":
        if (tx.status === "completed" || tx.status === "captured") {
          contestEntriesCents += amount;
        }
        break;
      case "deposit":
        if (tx.status === "completed" || tx.status === "captured") {
          depositsCents += amount;
        }
        break;
      case "withdrawal":
        if (tx.status === "completed") withdrawalsCents += amount;
        break;
      case "refund":
        if (tx.status === "refunded" || tx.status === "completed") refundsCents += amount;
        break;
      case "reward_credit":
        if (tx.status === "completed") rewardCreditsCents += amount;
        break;
      default:
        break;
    }
  }

  return {
    pendingBalanceCents,
    contestEntriesCents,
    depositsCents,
    withdrawalsCents,
    refundsCents,
    rewardCreditsCents,
  };
}

async function buildSquareWalletBalances(email: string): Promise<SquareWalletBalanceBreakdown> {
  const normalized = normalizeEmail(email);
  const ledgerSummary = await getWalletSummaryForLegacy(normalized).catch(() => null);

  const [transactions, playerDash, ecosystem, inventory] = await Promise.all([
    listPaymentTransactionsForPlayer(normalized, 500).catch(() => [] as PaymentTransactionRecord[]),
    getPlayerDashboard(normalized).catch(() => null),
    getEcosystemDashboard(normalized).catch(() => null),
    getInventorySummary(normalized).catch(() => null),
  ]);

  const txAgg = aggregateTransactionBalances(transactions);

  const contestWinningsCents =
    ledgerSummary?.lifetime?.winningsCents ??
    Math.round((playerDash?.stats.totalWinnings ?? 0) * 100);
  const pendingPayoutCents = ledgerSummary
    ? ledgerSummary.pendingBalanceCents
    : Math.round(
        (playerDash?.recentWins ?? [])
          .filter((w) => w.payoutStatus === "pending")
          .reduce((sum, w) => sum + w.amount, 0) * 100
      );

  const marketplaceCreditsCents =
    (ecosystem?.account.squareCreditsCents ?? 0) + (ecosystem?.account.pickemCreditsCents ?? 0);
  const promotionalCreditsCents =
    ledgerSummary?.balances.promotional ?? inventory?.counts.promo_credit ?? 0;

  return {
    availableBalanceCents: ledgerSummary?.availableBalanceCents ?? 0,
    pendingBalanceCents: txAgg.pendingBalanceCents + pendingPayoutCents,
    contestEntriesCents:
      ledgerSummary?.lifetime?.contestEntriesCents ?? txAgg.contestEntriesCents,
    contestWinningsCents,
    depositsCents: ledgerSummary?.lifetime?.depositsCents ?? txAgg.depositsCents,
    withdrawalsCents: ledgerSummary?.lifetime?.withdrawalsCents ?? txAgg.withdrawalsCents,
    rewardCreditsCents:
      (ledgerSummary?.balances.rewardCredits ?? 0) + txAgg.rewardCreditsCents,
    marketplaceCreditsCents,
    promotionalCreditsCents,
    refundsCents: txAgg.refundsCents,
    giftCardBalanceCents: FUTURE_PLACEHOLDER,
    teamWalletBalanceCents: FUTURE_PLACEHOLDER,
    familyWalletBalanceCents: FUTURE_PLACEHOLDER,
    subscriptionCreditsCents: FUTURE_PLACEHOLDER,
  };
}

/** SquareWallet™ — platform-owned wallet experience layer. */
export async function getSquareWallet(email: string): Promise<SquareWalletSummary> {
  const normalized = normalizeEmail(email);
  const [wallet, balances] = await Promise.all([
    getPlayerWallet(normalized),
    buildSquareWalletBalances(normalized),
  ]);

  return {
    email: normalized,
    providerCustomerId: wallet.stripeCustomerId,
    defaultPaymentMethodId: wallet.defaultPaymentMethodId,
    paymentMethodBrand: wallet.brand,
    paymentMethodLast4: wallet.last4,
    fastCheckoutAvailable: wallet.fastCheckoutAvailable,
    accountSuspended: wallet.accountSuspended,
    availableBalanceCents: balances.availableBalanceCents,
    pendingBalanceCents: balances.pendingBalanceCents,
    balances,
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
