import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import {
  hasPickemEntryForContest,
  pickemEntryAmountCents,
  reservePickemEntryPurchase,
} from "@/lib/pickem/entryPurchase";
import { PURCHASE_TYPE_PICKEM_ENTRY } from "@/lib/platform/core/checkoutMetadata";
import {
  formatTierCents,
  isValidEntryTierCents,
} from "@/lib/platform/core/entryTiers";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAppUrl, getCheckoutMissingConfig } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/playerWallet";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  noStore();

  const missing = getCheckoutMissingConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Checkout is not configured. Missing: ${missing.join(", ")}` },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Sign in to enter Pick'em." }, { status: 401 });
  }

  const eligibilityError = await requirePlayEligible(user.email);
  if (eligibilityError) return eligibilityError;

  try {
    const body = (await request.json()) as {
      contestId?: string;
      entryTierCents?: number;
      tier?: number;
    };

    const contestId = body.contestId?.trim();
    const rawTier = body.entryTierCents ?? body.tier;
    const entryTierCents =
      typeof rawTier === "number" && isValidEntryTierCents(rawTier) ? rawTier : 1000;

    if (!contestId) {
      return NextResponse.json({ error: "Contest is required." }, { status: 400 });
    }

    const contest = await getPickemContestById(contestId);
    if (!contest) {
      return NextResponse.json({ error: "Contest not found." }, { status: 404 });
    }

    if (contest.status === "complete") {
      return NextResponse.json({ error: "This week is already complete." }, { status: 400 });
    }

    const email = normalizeEmail(user.email);
    const alreadyPaid = await hasPickemEntryForContest({
      contestId,
      email,
      entryTierCents,
    });

    if (alreadyPaid) {
      return NextResponse.json(
        { error: "You already entered this tier for this week." },
        { status: 400 }
      );
    }

    const amountCents = pickemEntryAmountCents(entryTierCents);
    const tierLabel = formatTierCents(entryTierCents);
    const appUrl = getAppUrl();
    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomer(email);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Pick'em ${contest.label} — ${tierLabel} Entry`,
              description: `Weekly NFL Pick'em entry at the ${tierLabel} tier. Picks lock at kickoff.`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/pickem/week?contestId=${encodeURIComponent(contestId)}&tier=${entryTierCents}&entry_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pickem/week?contestId=${encodeURIComponent(contestId)}&tier=${entryTierCents}`,
      payment_intent_data: {
        setup_future_usage: "off_session",
      },
      metadata: {
        purchaseType: PURCHASE_TYPE_PICKEM_ENTRY,
        contestId,
        email,
        entryTierCents: String(entryTierCents),
      },
    });

    if (!session.url || !session.id) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    await reservePickemEntryPurchase({
      contestId,
      email,
      entryTierCents,
      amountCents,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[pickem/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start checkout." },
      { status: 500 }
    );
  }
}
