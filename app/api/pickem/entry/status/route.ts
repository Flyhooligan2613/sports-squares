import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fulfillPickemEntryPurchase,
  getPickemEntryPurchaseBySession,
} from "@/lib/pickem/entryPurchase";
import { PaymentEngine } from "@/lib/platform/engines/payment";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ status: "pending" });
  }

  try {
    let purchase = await getPickemEntryPurchaseBySession(sessionId);

    if (
      purchase?.status !== "paid" &&
      PaymentEngine.isConfigured() &&
      purchase?.email === normalizeEmail(user.email)
    ) {
      const session = await PaymentEngine.retrieveCheckoutSession(sessionId);
      if (session?.paid && session.metadata?.contestId) {
        await fulfillPickemEntryPurchase({
          contestId: session.metadata.contestId,
          email: session.metadata.email ?? user.email,
          entryTierCents: Number(session.metadata.entryTierCents ?? 1000),
          stripeCheckoutSessionId: sessionId,
          amountPaidCents: session.amountCents,
          stripePaymentIntentId: session.paymentIntentId,
        });
        purchase = await getPickemEntryPurchaseBySession(sessionId);
      }
    }

    if (!purchase || purchase.email !== normalizeEmail(user.email)) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({
      status: purchase.status,
      leagueId: purchase.leagueId,
      entryTierCents: purchase.entryTierCents,
      contestId: purchase.contestId,
    });
  } catch (err) {
    console.error("[pickem/entry/status]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
