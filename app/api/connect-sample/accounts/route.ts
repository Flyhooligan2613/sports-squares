import { NextResponse } from "next/server";
import { ConnectSampleConfigError, jsonError } from "@/lib/stripe/connectSample/errors";
import {
  createConnectSampleV2Account,
  retrieveConnectSampleV2Account,
} from "@/lib/stripe/connectSample/v2Accounts";
import {
  displayNameFromV2Account,
  parseConnectSampleAccountStatus,
} from "@/lib/stripe/connectSample/accountStatus";
import { saveConnectSampleAccountMapping } from "@/lib/stripe/connectSample/database";
import { connectSampleDisabledResponse } from "@/lib/security/connectSampleGuard";

export const dynamic = "force-dynamic";

/** POST — Create a V2 connected account and store demo user → account mapping */
export async function POST(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as {
      displayName?: string;
      contactEmail?: string;
    };

    const displayName = body.displayName?.trim();
    const contactEmail = body.contactEmail?.trim().toLowerCase();

    if (!displayName || !contactEmail) {
      return jsonError("displayName and contactEmail are required.");
    }

    const account = await createConnectSampleV2Account({
      displayName,
      contactEmail,
    });

    try {
      await saveConnectSampleAccountMapping({
        demoUserEmail: contactEmail,
        stripeAccountId: account.id,
        displayName: displayNameFromV2Account(account),
      });
    } catch (dbErr) {
      // Stripe account was created — don't fail if Supabase schema cache is still refreshing.
      console.warn("[connect-sample/accounts POST] mapping not saved", dbErr);
    }

    const status = parseConnectSampleAccountStatus(account);

    return NextResponse.json({
      accountId: account.id,
      status,
    });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/accounts POST]", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create connected account.";
    return jsonError(message, 500);
  }
}

/** GET — Live account status from Stripe API (never from DB) */
export async function GET(request: Request) {
  const blocked = connectSampleDisabledResponse();
  if (blocked) return blocked;

  try {
    const accountId = new URL(request.url).searchParams.get("accountId")?.trim();
    if (!accountId) {
      return jsonError("accountId query parameter is required.");
    }

    const account = await retrieveConnectSampleV2Account(accountId);
    return NextResponse.json({
      account,
      status: parseConnectSampleAccountStatus(account),
    });
  } catch (err) {
    if (err instanceof ConnectSampleConfigError) {
      return jsonError(err.message, 503);
    }
    console.error("[connect-sample/accounts GET]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to retrieve account.",
      500
    );
  }
}
