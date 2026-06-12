import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  connectErrorMessage,
  ensureConnectAccountId,
  getPlayerConnectStatus,
  refreshPlayerConnectStatus,
} from "@/lib/database/services/stripeConnect";
import {
  createConnectAccountLink,
  createExpressConnectAccount,
  isStripeConnectEnabled,
} from "@/lib/stripe/connect";
import { isStripeConfigured } from "@/lib/stripe/config";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Payout setup is unavailable — server not configured." },
      { status: 503 }
    );
  }

  if (!isStripeConnectEnabled()) {
    return NextResponse.json(
      { error: "Stripe Connect payouts are not enabled yet." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = normalizeEmail(user.email);
    let status = await getPlayerConnectStatus(email);
    let accountId = status.accountId;

    if (!accountId) {
      const account = await createExpressConnectAccount(email);
      accountId = account.id;
      await ensureConnectAccountId(email, accountId);
      status = await getPlayerConnectStatus(email);
    } else {
      status = await refreshPlayerConnectStatus(email);
      accountId = status.accountId ?? accountId;
    }

    if (!accountId) {
      throw new Error("Could not save Stripe Connect account for this player.");
    }

    const linkType = status.payoutsEnabled ? "account_update" : "account_onboarding";
    const link = await createConnectAccountLink(accountId, linkType);

    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("[connect/onboard]", err);
    return NextResponse.json(
      { error: connectErrorMessage(err) },
      { status: 500 }
    );
  }
}
