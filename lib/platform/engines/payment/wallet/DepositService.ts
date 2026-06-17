import { PaymentEngine, getAppUrl } from "@/lib/platform/engines/payment";
import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import { normalizeEmail } from "@/lib/player/statsCore";
import { MIN_DEPOSIT_CENTS } from "./config";
import { grantFirstDepositMatchBonus } from "./DepositBonusService";
import { creditBalance } from "./WalletLedgerService";
import { ensureSquareWallet } from "./WalletLifecycleService";
import { findWalletByEmail } from "./repository";

export const PURCHASE_TYPE_WALLET_DEPOSIT = "wallet_deposit";

export async function initiateDeposit(input: {
  email: string;
  amountCents: number;
  returnPath?: string;
}): Promise<{ ok: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
  const amountCents = Math.floor(input.amountCents);
  if (amountCents < MIN_DEPOSIT_CENTS) {
    return {
      ok: false,
      error: `Minimum deposit is $${(MIN_DEPOSIT_CENTS / 100).toFixed(2)}.`,
    };
  }

  if (!PaymentEngine.isConfigured()) {
    return { ok: false, error: "SquareWallet deposits are not configured yet." };
  }

  await ensureSquareWallet(input.email);
  const appUrl = getAppUrl();
  const returnPath = input.returnPath ?? "/my-games/wallet";

  const result = await PaymentEngine.deposit({
    email: normalizeEmail(input.email),
    amountCents,
    description: "SquareWallet™ deposit",
    successUrl: `${appUrl}${returnPath}?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}${returnPath}?deposit=cancelled`,
    setupFutureUsage: true,
    metadata: {
      purchaseType: PURCHASE_TYPE_WALLET_DEPOSIT,
      walletDeposit: "true",
      email: normalizeEmail(input.email),
    },
    lineItems: [
      {
        name: "SquareWallet™ Deposit",
        description: "Add funds to your SquareWallet",
        unitAmountCents: amountCents,
        quantity: 1,
      },
    ],
  });

  if (!result.ok || !result.checkoutUrl) {
    return {
      ok: false,
      error: result.error?.userMessage ?? "Could not start deposit checkout.",
    };
  }

  return { ok: true, checkoutUrl: result.checkoutUrl, sessionId: result.sessionId };
}

/** Called after PaymentEngine checkout completes for wallet deposits. */
export async function confirmDeposit(input: {
  email: string;
  amountCents: number;
  sessionId: string;
  paymentIntentId?: string | null;
}): Promise<void> {
  const wallet = await ensureSquareWallet(input.email);

  const tx = await recordPaymentTransaction({
    playerEmail: input.email,
    provider: getPaymentProviderId(),
    providerTransactionId: input.paymentIntentId ?? input.sessionId,
    walletType: "available",
    transactionType: "deposit",
    amountCents: input.amountCents,
    status: "completed",
    idempotencyKey: `wallet_deposit_${input.sessionId}`,
    auditAction: "square_wallet_deposit",
    auditDetail: "Funds credited to available balance",
  });

  await creditBalance({
    email: input.email,
    walletId: wallet.id,
    balanceType: "available",
    amountCents: input.amountCents,
    entryType: "deposit",
    paymentTransactionId: tx.id,
    referenceType: "checkout_session",
    referenceId: input.sessionId,
    description: "SquareWallet™ deposit",
    lifetimeField: "lifetimeDepositsCents",
  });

  await grantFirstDepositMatchBonus({
    email: input.email,
    walletId: wallet.id,
    depositAmountCents: input.amountCents,
    depositReferenceId: input.sessionId,
    paymentTransactionId: tx.id,
  });
}

export async function syncDepositFromSession(input: {
  email: string;
  sessionId: string;
  amountCents: number;
  paymentIntentId?: string | null;
}): Promise<boolean> {
  const wallet = await findWalletByEmail(input.email);
  if (!wallet) return false;

  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  const { data } = await getSupabaseAdmin()
    .from("square_wallet_ledger_entries")
    .select("id")
    .eq("wallet_id", wallet.id)
    .eq("reference_id", input.sessionId)
    .eq("entry_type", "deposit")
    .maybeSingle();

  if (data?.id) return false;

  await confirmDeposit(input);
  return true;
}
