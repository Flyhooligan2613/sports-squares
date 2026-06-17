import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { getStripeClient } from "@/lib/stripe/connectSample/client";
import { getSubscriptionWebhookSecret } from "@/lib/stripe/connectSample/config";
import { handleConnectSampleSubscriptionEvent } from "@/lib/stripe/connectSample/webhooks/subscriptionEvents";
import { connectSampleDisabledResponse } from "@/lib/security/connectSampleGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Standard webhook endpoint for subscription lifecycle events (not thin events).
 * Listen for customer.subscription.* and invoice.paid in Stripe Dashboard.
 */
export async function POST(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  const webhookSecret = getSubscriptionWebhookSecret();
  if (!webhookSecret) {
    return jsonError(
      "STRIPE_WEBHOOK_SECRET (or STRIPE_CONNECT_SAMPLE_WEBHOOK_SECRET) is not configured.",
      503
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonError("Missing stripe-signature header.", 400);
  }

  let event: Stripe.Event;

  try {
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Invalid webhook signature.",
      400
    );
  }

  try {
    await handleConnectSampleSubscriptionEvent(event);
    return NextResponse.json({ received: true, type: event.type });
  } catch (err) {
    console.error("[connect-sample/webhooks/subscriptions]", err);
    return jsonError(
      err instanceof Error ? err.message : "Subscription webhook failed.",
      500
    );
  }
}
