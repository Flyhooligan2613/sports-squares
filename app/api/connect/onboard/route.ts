import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  connectErrorMessage,
  ensureConnectAccountId,
  getPlayerConnectIdentityPrefill,
  getPlayerConnectStatus,
  refreshPlayerConnectStatus,
  syncConnectAccountFromStripeV2,
} from "@/lib/database/services/stripeConnect";
import {
  PaymentEngine,
  isStripeProductionMisconfigured,
} from "@/lib/platform/engines/payment";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { requireStepUpFromRequest } from "@/lib/auth/security/stepUp";
import { notifySecurityEvent } from "@/lib/auth/security/notify";
import { emailHasPasskey } from "@/lib/auth/security/webauthn";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!PaymentEngine.isConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Payout setup is unavailable — server not configured." },
      { status: 503 }
    );
  }

  if (!PaymentEngine.isConnectEnabled()) {
    return NextResponse.json(
      { error: "Stripe Connect payouts are not enabled yet." },
      { status: 503 }
    );
  }

  if (isStripeProductionMisconfigured()) {
    return NextResponse.json(
      {
        error:
          "Cash-out setup is unavailable — production is using Stripe test keys. Test mode only shows fake banks (Chase, Wells Fargo, etc. require live keys). Contact support@squareboards.pro.",
        stripeMode: "test",
        productionMisconfigured: true,
      },
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

  const email = normalizeEmail(user.email);
  const existingStatus = await getPlayerConnectStatus(email);
  const isFirstTimeSetup = !existingStatus.accountId;

  const stepUp = await requireStepUpFromRequest(request, "payout_change");
  const hasPasskey = await emailHasPasskey(user.email);
  if (hasPasskey && !stepUp.ok && !isFirstTimeSetup) {
    return NextResponse.json({ error: stepUp.error, requiresStepUp: true }, { status: 403 });
  }

  try {
    let status = existingStatus;
    let accountId = status.accountId;
    const useV2 = PaymentEngine.isConnectV2PayoutsEnabled();
    const prefill = await getPlayerConnectIdentityPrefill(email);

    if (!accountId) {
      if (useV2) {
        const account = await PaymentEngine.createConnectV2WinnerAccount({
          email,
          displayName: prefill.displayName,
          prefill,
        });
        accountId = account.id;
        await ensureConnectAccountId(email, accountId);
        await syncConnectAccountFromStripeV2(email, account);
      } else {
        const account = await PaymentEngine.createConnectExpressAccount(email);
        accountId = account.id;
        await ensureConnectAccountId(email, accountId);
      }
      status = await getPlayerConnectStatus(email);
      await notifySecurityEvent({
        email,
        eventType: "payout_change",
        metadata: { action: "connect_account_created" },
      }).catch(() => undefined);
    } else {
      status = await refreshPlayerConnectStatus(email);
      accountId = status.accountId ?? accountId;
    }

    if (!accountId) {
      throw new Error("Could not save Connect cash-out account for this player.");
    }

    const linkType = status.payoutsEnabled ? "account_update" : "account_onboarding";
    const url = await PaymentEngine.createConnectOnboardingLink({
      accountId,
      useV2,
      linkType,
      prefill,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[connect/onboard]", err);
    return NextResponse.json(
      { error: connectErrorMessage(err) },
      { status: 500 }
    );
  }
}
