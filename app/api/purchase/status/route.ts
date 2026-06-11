import { NextResponse } from "next/server";
import {
  fulfillPurchase,
  getFulfillmentBySessionId,
} from "@/lib/purchases/fulfill";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { isStripeConfigured } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Purchase status is not configured." },
      { status: 503 }
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    let result = await getFulfillmentBySessionId(sessionId);

    if (!result) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid" && session.metadata) {
        const metadata = session.metadata;
        result = await fulfillPurchase({
          poolId: metadata.poolId,
          name: metadata.name,
          email: metadata.email,
          phone: metadata.phone || undefined,
          squaresCount: Number(metadata.squaresCount),
          stripeCheckoutSessionId: session.id,
          amountPaidCents: session.amount_total ?? 0,
        });
      }
    }

    if (!result) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({
      status: "fulfilled",
      inviteUrl: result.inviteUrl,
      invitePath: `/join/${result.inviteToken}`,
      inviteToken: result.inviteToken,
      playerId: result.playerId,
      inviteDeliveryStatus: result.inviteDeliveryStatus,
      inviteDeliveryError: result.inviteDeliveryError ?? null,
      smsDeliveryStatus: result.smsDeliveryStatus,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load purchase status.",
      },
      { status: 500 }
    );
  }
}
