import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/connectSample/client";
import {
  getApplicationFeeCents,
  getConnectSampleBaseUrl,
} from "@/lib/stripe/connectSample/config";

/** customer_account is supported on stripe@latest; cast until SDK is upgraded locally */
type SessionCreateWithCustomerAccount = Stripe.Checkout.SessionCreateParams & {
  customer_account?: string;
};

type BillingPortalCreateWithCustomerAccount =
  Stripe.BillingPortal.SessionCreateParams & {
    customer_account?: string;
  };

/**
 * Direct Charge on the connected account with a platform application fee.
 * Uses hosted Checkout for simplicity.
 */
export async function createConnectSampleCheckoutSession(input: {
  connectedAccountId: string;
  productName: string;
  unitAmountCents: number;
  currency?: string;
  quantity?: number;
}): Promise<string> {
  const stripeClient = getStripeClient();
  const quantity = input.quantity ?? 1;

  const session = await stripeClient.checkout.sessions.create(
    {
      line_items: [
        {
          price_data: {
            currency: input.currency ?? "usd",
            product_data: {
              name: input.productName,
            },
            unit_amount: input.unitAmountCents,
          },
          quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: getApplicationFeeCents(),
      },
      mode: "payment",
      success_url: `${getConnectSampleBaseUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getConnectSampleBaseUrl()}/storefront/${input.connectedAccountId}`,
    },
    {
      stripeAccount: input.connectedAccountId,
    }
  );

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a URL.");
  }

  return session.url;
}

/** Platform subscription checkout — uses customer_account (V2 account ID) */
export async function createConnectSampleSubscriptionCheckout(input: {
  connectedAccountId: string;
  priceId: string;
}): Promise<string> {
  const stripeClient = getStripeClient();

  const session = await stripeClient.checkout.sessions.create({
    customer_account: input.connectedAccountId,
    mode: "subscription",
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${getConnectSampleBaseUrl()}?session_id={CHECKOUT_SESSION_ID}&subscribed=1`,
    cancel_url: `${getConnectSampleBaseUrl()}?canceled=1`,
  } as SessionCreateWithCustomerAccount);

  if (!session.url) {
    throw new Error("Stripe subscription Checkout did not return a URL.");
  }

  return session.url;
}

/** Billing portal for connected account to manage subscription */
export async function createConnectSampleBillingPortalSession(input: {
  connectedAccountId: string;
}): Promise<string> {
  const stripeClient = getStripeClient();

  const session = await stripeClient.billingPortal.sessions.create({
    customer_account: input.connectedAccountId,
    return_url: getConnectSampleBaseUrl(),
  } as BillingPortalCreateWithCustomerAccount);

  if (!session.url) {
    throw new Error("Stripe Billing Portal did not return a URL.");
  }

  return session.url;
}
