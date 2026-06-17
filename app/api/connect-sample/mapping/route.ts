import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { getConnectSampleAccountByEmail } from "@/lib/stripe/connectSample/database";
import { connectSampleDisabledResponse } from "@/lib/security/connectSampleGuard";

export const dynamic = "force-dynamic";

/** GET — Load stored demo user → account mapping (account ID only; status comes from Stripe API) */
export async function GET(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  try {
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return jsonError("email query parameter is required.");
    }

    const record = await getConnectSampleAccountByEmail(email);
    return NextResponse.json({ record });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/mapping]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to load account mapping.",
      500
    );
  }
}
