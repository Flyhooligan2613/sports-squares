import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import { createConnectSampleAccountLink } from "@/lib/stripe/connectSample/v2Accounts";
import { getConnectSampleBaseUrlFromRequest } from "@/lib/stripe/connectSample/config";
import { connectSampleDisabledResponse } from "@/lib/security/connectSampleGuard";

export const dynamic = "force-dynamic";

/** POST — Create a hosted onboarding Account Link (V2 API) */
export async function POST(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId) {
      return jsonError("accountId is required.");
    }

    const base = getConnectSampleBaseUrlFromRequest(request);
    const url = await createConnectSampleAccountLink({
      accountId,
      refreshUrl: `${base}?accountId=${accountId}&connect=refresh`,
      returnUrl: `${base}?accountId=${accountId}&connect=complete`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/account-links]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to create account link.",
      500
    );
  }
}
