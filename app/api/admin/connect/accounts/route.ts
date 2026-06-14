import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  getConnectProfileForAccountId,
  getPlayerConnectIdentityPrefill,
  getPlayerConnectStatus,
  refreshPlayerConnectStatus,
  connectErrorMessage,
} from "@/lib/database/services/stripeConnect";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  isStripeConnectEnabled,
  isStripeConnectV2PayoutsEnabled,
} from "@/lib/stripe/connect";
import { isStripeConfigured } from "@/lib/stripe/config";
import {
  diagnoseWinnerConnectV2Account,
  repairWinnerConnectV2Account,
} from "@/lib/stripe/connectV2Diagnostics";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function resolveAccountLookup(searchParams: URLSearchParams): Promise<{
  accountId: string;
  playerEmail: string | null;
  dbStatus: Awaited<ReturnType<typeof getPlayerConnectStatus>> | null;
} | null> {
  const emailParam = searchParams.get("email")?.trim();
  const accountIdParam = searchParams.get("accountId")?.trim();

  if (emailParam) {
    const email = normalizeEmail(emailParam);
    const dbStatus = await getPlayerConnectStatus(email);
    if (!dbStatus.accountId) return null;
    return { accountId: dbStatus.accountId, playerEmail: email, dbStatus };
  }

  if (accountIdParam) {
    const profile = await getConnectProfileForAccountId(accountIdParam);
    return {
      accountId: accountIdParam,
      playerEmail: profile?.email ?? null,
      dbStatus: profile
        ? {
            accountId: profile.stripe_connect_account_id,
            detailsSubmitted: profile.stripe_connect_details_submitted,
            payoutsEnabled: profile.stripe_connect_payouts_enabled,
            ready: profile.stripe_connect_payouts_enabled,
          }
        : null,
    };
  }

  return null;
}

export async function GET(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  if (!isStripeConnectEnabled()) {
    return NextResponse.json({ error: "Stripe Connect is disabled." }, { status: 503 });
  }

  if (!isStripeConnectV2PayoutsEnabled()) {
    return NextResponse.json({
      error: "Connect diagnostics only applies to Accounts v2 payouts (STRIPE_CONNECT_V2_PAYOUTS=true).",
    }, { status: 400 });
  }

  const lookup = await resolveAccountLookup(new URL(request.url).searchParams);
  if (!lookup) {
    return NextResponse.json(
      { error: "Provide ?email= or ?accountId= for a player with a Connect account." },
      { status: 400 }
    );
  }

  try {
    const report = await diagnoseWinnerConnectV2Account(lookup);
    return NextResponse.json({
      ...report,
      connectV2Enabled: true,
    });
  } catch (err) {
    console.error("[admin/connect/accounts GET]", err);
    return NextResponse.json({ error: connectErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  if (!isStripeConnectV2PayoutsEnabled()) {
    return NextResponse.json({ error: "Accounts v2 payouts not enabled." }, { status: 400 });
  }

  const body = (await request.json()) as {
    email?: string;
    accountId?: string;
    action?: "repair" | "sync";
  };

  const params = new URLSearchParams();
  if (body.email) params.set("email", body.email);
  if (body.accountId) params.set("accountId", body.accountId);

  const lookup = await resolveAccountLookup(params);
  if (!lookup) {
    return NextResponse.json({ error: "Player or Connect account not found." }, { status: 404 });
  }

  try {
    if (body.action === "sync") {
      if (!lookup.playerEmail) {
        return NextResponse.json({ error: "Cannot sync without a linked player email." }, { status: 400 });
      }
      const dbStatus = await refreshPlayerConnectStatus(lookup.playerEmail);
      const report = await diagnoseWinnerConnectV2Account({
        ...lookup,
        dbStatus,
      });
      return NextResponse.json({ ok: true, action: "sync", ...report });
    }

    const report = await repairWinnerConnectV2Account(
      lookup.accountId,
      lookup.playerEmail
        ? await getPlayerConnectIdentityPrefill(lookup.playerEmail)
        : undefined
    );
    let dbStatus = lookup.dbStatus;

    if (lookup.playerEmail) {
      dbStatus = await refreshPlayerConnectStatus(lookup.playerEmail);
    }

    return NextResponse.json({
      ok: true,
      action: body.action ?? "repair",
      ...report,
      dbStatus,
    });
  } catch (err) {
    console.error("[admin/connect/accounts POST]", err);
    return NextResponse.json({ error: connectErrorMessage(err) }, { status: 500 });
  }
}
