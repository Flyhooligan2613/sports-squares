import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { createConnectSampleProduct } from "@/lib/stripe/connectSample/products";
import { connectSampleDisabledResponse } from "@/lib/security/connectSampleGuard";

export const dynamic = "force-dynamic";

/** POST — Create a product on the connected account (Stripe-Account header) */
export async function POST(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as {
      accountId?: string;
      name?: string;
      description?: string;
      priceInCents?: number;
      currency?: string;
    };

    const accountId = body.accountId?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() ?? "";
    const priceInCents = Number(body.priceInCents);

    if (!accountId || !name || !Number.isFinite(priceInCents) || priceInCents < 50) {
      return jsonError(
        "accountId, name, and priceInCents (>= 50) are required."
      );
    }

    const product = await createConnectSampleProduct({
      connectedAccountId: accountId,
      name,
      description,
      priceInCents,
      currency: body.currency ?? "usd",
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/products POST]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to create product.",
      500
    );
  }
}
