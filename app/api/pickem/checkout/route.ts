import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
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
import {
  PaymentEngine,
  getAppUrl,
} from "@/lib/platform/engines/payment";
import { requirePlayEligible } from "@/lib/payments/requirePlayEligible";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  noStore();

  const missing = PaymentEngine.getMissingConfig();
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

    const result = await PaymentEngine.deposit({
      email,
      amountCents,
      description: `Pick'em ${contest.label} — ${tierLabel} Entry`,
      successUrl: `${appUrl}/pickem/week?contestId=${encodeURIComponent(contestId)}&tier=${entryTierCents}&entry_session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/pickem/week?contestId=${encodeURIComponent(contestId)}&tier=${entryTierCents}`,
      setupFutureUsage: true,
      lineItems: [
        {
          name: `Pick'em ${contest.label} — ${tierLabel} Entry`,
          description: `Weekly NFL Pick'em entry at the ${tierLabel} tier. Picks lock at kickoff.`,
          unitAmountCents: amountCents,
          quantity: 1,
        },
      ],
      metadata: {
        purchaseType: PURCHASE_TYPE_PICKEM_ENTRY,
        contestId,
        email,
        entryTierCents: String(entryTierCents),
      },
    });

    if (!result.ok || !result.checkoutUrl || !result.sessionId) {
      return NextResponse.json(
        { error: result.error?.userMessage ?? "Could not create checkout session." },
        { status: 500 }
      );
    }

    await reservePickemEntryPurchase({
      contestId,
      email,
      entryTierCents,
      amountCents,
      sessionId: result.sessionId,
      paymentIntentId: null,
    });

    return NextResponse.json({ url: result.checkoutUrl, sessionId: result.sessionId });
  } catch (err) {
    console.error("[pickem/checkout]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "checkout") },
      { status: 500 }
    );
  }
}
