import { NextResponse } from "next/server";
import {
  fulfillPurchase,
  reversePurchaseBySession,
} from "@/lib/purchases/fulfill";
import { recordWebhookEvent } from "@/lib/purchases/ledger";
import { getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSquaresCount(raw: string | undefined): number | null {
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < 1 || value > 100) return null;
  return value;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
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

async function handleChargeRefunded(charge: Stripe.Charge) {
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

  await reversePurchaseBySession(sessionId);
}

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Invalid webhook signature.",
      },
      { status: 400 }
    );
  }

  try {
    const dedup = await recordWebhookEvent(event.id, event.type);
    if (dedup === "duplicate") {
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (err) {
    console.error("Webhook dedup failed:", err);
    return NextResponse.json({ error: "Webhook dedup failed." }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(event.data.object as Stripe.Charge);
    }
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed:`, err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Webhook handler failed.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
