import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { createConnectSampleCheckoutSession } from "@/lib/stripe/connectSample/checkout";

export const dynamic = "force-dynamic";

/** POST — Direct charge Checkout on connected account with application fee */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      productName?: string;
      unitAmountCents?: number;
      currency?: string;
      quantity?: number;
    };

    const accountId = body.accountId?.trim();
    const productName = body.productName?.trim();
    const unitAmountCents = Number(body.unitAmountCents);

    if (!accountId || !productName || !Number.isFinite(unitAmountCents)) {
      return jsonError("accountId, productName, and unitAmountCents are required.");
    }

    const url = await createConnectSampleCheckoutSession({
      connectedAccountId: accountId,
      productName,
      unitAmountCents,
      currency: body.currency ?? "usd",
      quantity: body.quantity ?? 1,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/checkout]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to create checkout session.",
      500
    );
  }
}
