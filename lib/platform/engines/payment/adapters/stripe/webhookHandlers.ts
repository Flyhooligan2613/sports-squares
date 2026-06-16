import type Stripe from "stripe";
import {
  fulfillPurchase,
  reversePurchaseBySession,
} from "@/lib/purchases/fulfill";
import {
  fulfillPickemEntryPurchase,
  reversePickemEntryBySession,
} from "@/lib/pickem/entryPurchase";
import {
  PURCHASE_TYPE_PICKEM_ENTRY,
  PURCHASE_TYPE_WALLET_DEPOSIT,
  resolvePurchaseType,
} from "@/lib/platform/core/checkoutMetadata";
import {
  syncConnectAccountFromStripe,
  syncConnectAccountFromStripeV2,
} from "@/lib/database/services/stripeConnect";
import {
  isStripeConnectV2PayoutsEnabled,
} from "@/lib/platform/engines/payment/adapters/stripe/connect";
import { retrieveWinnerConnectV2Account } from "@/lib/platform/engines/payment/adapters/stripe/connectV2Payouts";
import { syncPlayerWalletFromCheckoutSession } from "@/lib/platform/engines/payment/adapters/stripe/playerWallet";
import { getStripe } from "@/lib/platform/engines/payment/adapters/stripe/client";
import { getStripeWebhookSecret } from "@/lib/platform/engines/payment/adapters/stripe/config";
import {
  orchestrateCheckoutSessionCompleted,
  orchestrateWebhookRefund,
} from "@/lib/platform/engines/payment/orchestrator";
import { normalizeEmail } from "@/lib/player/statsCore";

function parseSquaresCount(raw: string | undefined): number | null {
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < 1 || value > 100) return null;
  return value;
}

async function handleSquaresCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid.");
  }

  const metadata = session.metadata ?? {};
  const poolId = metadata.poolId;
  const name = metadata.name;
  const email = metadata.email;
  const phone = metadata.phone || undefined;
  const squaresCount = parseSquaresCount(metadata.squaresCount);

  if (!poolId || !name || !email || !session.id || squaresCount === null) {
    throw new Error("Missing or invalid session metadata.");
  }

  await fulfillPurchase({
    poolId,
    name,
    email,
    phone,
    squaresCount,
    stripeCheckoutSessionId: session.id,
    amountPaidCents: session.amount_total ?? 0,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });
}

async function handlePickemEntryCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid.");
  }

  const metadata = session.metadata ?? {};
  const contestId = metadata.contestId;
  const email = metadata.email;
  const entryTierCents = Math.floor(Number(metadata.entryTierCents));

  if (!contestId || !email || !session.id || !Number.isFinite(entryTierCents)) {
    throw new Error("Missing or invalid Pick'em entry metadata.");
  }

  await fulfillPickemEntryPurchase({
    contestId,
    email,
    entryTierCents,
    stripeCheckoutSessionId: session.id,
    amountPaidCents: session.amount_total ?? 0,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });
}

async function handleWalletDepositCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    throw new Error("Checkout session is not paid.");
  }

  const metadata = session.metadata ?? {};
  const email = metadata.email ?? session.customer_details?.email;
  if (!email || !session.id) {
    throw new Error("Missing wallet deposit metadata.");
  }

  const { SquareWalletEngine } = await import("@/lib/platform/engines/payment/wallet");
  await SquareWalletEngine.syncDepositFromSession({
    email: normalizeEmail(email),
    sessionId: session.id,
    amountCents: session.amount_total ?? 0,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });
}

export async function handleStripeCheckoutCompleted(session: Stripe.Checkout.Session) {
  const purchaseType = resolvePurchaseType(
    (session.metadata ?? {}) as Record<string, string | undefined>
  );

  if (purchaseType === PURCHASE_TYPE_WALLET_DEPOSIT) {
    await handleWalletDepositCheckout(session);
  } else if (purchaseType === PURCHASE_TYPE_PICKEM_ENTRY) {
    await handlePickemEntryCheckout(session);
  } else {
    await handleSquaresCheckout(session);
  }

  try {
    await syncPlayerWalletFromCheckoutSession(session);
  } catch (err) {
    console.error("[payment/webhook] wallet sync failed", err);
  }

  try {
    await orchestrateCheckoutSessionCompleted({
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      amountCents: session.amount_total ?? 0,
    });
  } catch (err) {
    console.error("[payment/webhook] transaction center sync failed", err);
  }
}

export async function handleStripeChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const stripe = getStripe();
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  const sessionId = sessions.data[0]?.id;
  if (!sessionId) return;

  const session = sessions.data[0];
  const purchaseType = resolvePurchaseType(
    (session.metadata ?? {}) as Record<string, string | undefined>
  );

  if (purchaseType === PURCHASE_TYPE_PICKEM_ENTRY) {
    await reversePickemEntryBySession(sessionId);
  } else {
    await reversePurchaseBySession(sessionId);
  }

  try {
    await orchestrateWebhookRefund({
      paymentIntentId,
      amountCents: charge.amount_refunded ?? 0,
      sessionId,
    });
  } catch (err) {
    console.error("[payment/webhook] refund transaction record failed", err);
  }
}

export async function handleStripeAccountUpdated(account: Stripe.Account) {
  const rawEmail = account.metadata?.email;
  if (!rawEmail?.trim()) return;

  const email = normalizeEmail(rawEmail);

  if (isStripeConnectV2PayoutsEnabled()) {
    try {
      const v2Account = await retrieveWinnerConnectV2Account(account.id);
      await syncConnectAccountFromStripeV2(email, v2Account);
      return;
    } catch (v2Err) {
      console.warn("[payment/webhook] V2 account sync failed, trying Express:", v2Err);
    }
  }

  await syncConnectAccountFromStripe(email, account);
}

export async function constructStripeWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
}

export async function dispatchStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    await handleStripeCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  } else if (event.type === "charge.refunded") {
    await handleStripeChargeRefunded(event.data.object as Stripe.Charge);
  } else if (event.type === "account.updated") {
    await handleStripeAccountUpdated(event.data.object as Stripe.Account);
  }
}
