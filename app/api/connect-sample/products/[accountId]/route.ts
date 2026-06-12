import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { listConnectSampleProducts } from "@/lib/stripe/connectSample/products";

export const dynamic = "force-dynamic";

/** GET — List products for a connected account storefront */
export async function GET(
  _request: Request,
  context: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await context.params;
    if (!accountId?.trim()) {
      return jsonError("accountId is required.");
    }

    const products = await listConnectSampleProducts(accountId.trim());
    return NextResponse.json({ products });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/products GET]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to list products.",
      500
    );
  }
}
