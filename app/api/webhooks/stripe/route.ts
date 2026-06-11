import { NextResponse } from "next/server";
import { fulfillPurchase } from "@/lib/purchases/fulfill";
import { getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};

    const poolId = metadata.poolId;
    const name = metadata.name;
    const email = metadata.email;
    const phone = metadata.phone || undefined;
    const squaresCount = Number(metadata.squaresCount);

    if (!poolId || !name || !email || !session.id) {
      return NextResponse.json({ error: "Missing session metadata." }, { status: 400 });
    }

    try {
      await fulfillPurchase({
        poolId,
        name,
        email,
        phone,
        squaresCount,
        stripeCheckoutSessionId: session.id,
        amountPaidCents: session.amount_total ?? 0,
      });
    } catch (err) {
      console.error("Stripe fulfillment failed:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Fulfillment failed.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
