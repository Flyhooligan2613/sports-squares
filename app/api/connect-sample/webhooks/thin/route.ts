import { NextResponse } from "next/server";
import {
  ConnectSampleConfigError,
  jsonError,
  requireEnv,
} from "@/lib/stripe/connectSample/errors";
import { getThinWebhookSecret } from "@/lib/stripe/connectSample/config";
import {
  handleConnectSampleThinEvent,
  loadThinEventFromNotification,
} from "@/lib/stripe/connectSample/webhooks/thinEvents";
import {
  parseConnectSampleThinEvent,
} from "@/lib/stripe/connectSample/v2Accounts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Thin webhook endpoint for V2 account requirement updates.
 *
 * Stripe CLI example:
 * stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to http://localhost:3000/api/connect-sample/webhooks/thin
 */
export async function POST(request: Request) {
  const webhookSecret = getThinWebhookSecret();
  if (!webhookSecret) {
    return jsonError(
      "STRIPE_CONNECT_SAMPLE_THIN_WEBHOOK_SECRET is not configured. Create a thin webhook destination in Stripe Dashboard.",
      503
    );
  }

  try {
    requireEnv("STRIPE_SECRET_KEY");
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    throw err;
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonError("Missing stripe-signature header.", 400);
  }

  try {
    const thinEvent = parseConnectSampleThinEvent(
      rawBody,
      signature,
      webhookSecret
    );

    const event = await loadThinEventFromNotification(thinEvent.id);
    await handleConnectSampleThinEvent(event);

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (err) {
    console.error("[connect-sample/webhooks/thin]", err);
    return jsonError(
      err instanceof Error ? err.message : "Thin webhook handler failed.",
      400
    );
  }
}
