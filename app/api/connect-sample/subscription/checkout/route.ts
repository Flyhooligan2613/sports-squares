import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { createConnectSampleSubscriptionCheckout } from "@/lib/stripe/connectSample/checkout";
import { getSubscriptionPriceId } from "@/lib/stripe/connectSample/config";

export const dynamic = "force-dynamic";

/** POST — Platform subscription checkout using customer_account (V2 account ID) */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId) {
      return jsonError("accountId is required.");
    }

    const priceId = getSubscriptionPriceId();
    const url = await createConnectSampleSubscriptionCheckout({
      connectedAccountId: accountId,
      priceId,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/subscription/checkout]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to start subscription checkout.",
      500
    );
  }
}
