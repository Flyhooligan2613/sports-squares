import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import {
  fulfillPickemEntryPurchase,
  hasPickemEntryForContest,
  pickemEntryAmountCents,
} from "@/lib/pickem/entryPurchase";
import { PURCHASE_TYPE_PICKEM_ENTRY } from "@/lib/platform/core/checkoutMetadata";
import {
  formatTierCents,
  isValidEntryTierCents,
} from "@/lib/platform/core/entryTiers";
import { normalizeEmail } from "@/lib/player/statsCore";
import { requireStepUpFromRequest } from "@/lib/auth/security/stepUp";
import { notifySecurityEvent } from "@/lib/auth/security/notify";
import { chargeSavedPaymentMethod } from "@/lib/stripe/playerWallet";
import { getCheckoutMissingConfig } from "@/lib/stripe/config";
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

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to enter Pick'em." }, { status: 401 });
  }

  const stepUp = await requireStepUpFromRequest(request, "purchase");
  if (!stepUp.ok) {
    return NextResponse.json({ error: stepUp.error }, { status: 403 });
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

    const paymentIntent = await chargeSavedPaymentMethod({
      email,
      amountCents,
      description: `Pick'em ${contest.label} — ${tierLabel}`,
      metadata: {
        purchaseType: PURCHASE_TYPE_PICKEM_ENTRY,
        contestId,
        email,
        entryTierCents: String(entryTierCents),
      },
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment could not be completed." }, { status: 402 });
    }

    const sessionKey = `pi_${paymentIntent.id}`;
    const result = await fulfillPickemEntryPurchase({
      contestId,
      email,
      entryTierCents,
      stripeCheckoutSessionId: sessionKey,
      amountPaidCents: amountCents,
      stripePaymentIntentId: paymentIntent.id,
    });

    await notifySecurityEvent({
      email,
      eventType: "purchase_confirmed",
      metadata: {
        type: "pickem",
        contest: contest.label,
        amount: tierLabel,
      },
    });

    return NextResponse.json({
      ok: true,
      leagueId: result.leagueId,
      alreadyFulfilled: result.alreadyFulfilled,
    });
  } catch (err) {
    console.error("[pickem/fast-checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fast checkout failed." },
      { status: 500 }
    );
  }
}
