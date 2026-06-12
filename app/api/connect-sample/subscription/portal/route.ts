import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { createConnectSampleBillingPortalSession } from "@/lib/stripe/connectSample/checkout";

export const dynamic = "force-dynamic";

/** POST — Billing portal for connected account subscription management */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId) {
      return jsonError("accountId is required.");
    }

    const url = await createConnectSampleBillingPortalSession({
      connectedAccountId: accountId,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/subscription/portal]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to open billing portal.",
      500
    );
  }
}
