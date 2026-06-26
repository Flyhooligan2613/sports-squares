import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import {
  fulfillPurchase,
  getFulfillmentBySessionId,
} from "@/lib/purchases/fulfill";
import { buildPurchaseStatusPayload } from "@/lib/purchases/statusPayload";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { PaymentEngine } from "@/lib/platform/engines/payment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!PaymentEngine.isConfigured() || !isSupabaseAdminConfigured()) {
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
      const session = await PaymentEngine.retrieveCheckoutSession(sessionId);

      if (session?.paid && session.metadata) {
        const metadata = session.metadata;
        result = await fulfillPurchase({
          poolId: metadata.poolId,
          name: metadata.name,
          email: metadata.email,
          phone: metadata.phone || undefined,
          squaresCount: Number(metadata.squaresCount),
          stripeCheckoutSessionId: sessionId,
          amountPaidCents: session.amountCents,
        });
      }
    }

    if (!result) {
      return NextResponse.json({ status: "pending" });
    }

    const payload = await buildPurchaseStatusPayload(sessionId, result);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          safeApiErrorMessage(err, "load"),
      },
      { status: 500 }
    );
  }
}
