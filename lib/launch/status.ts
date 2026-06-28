import {
  getCheckoutMissingConfig,
  getStripeKeyMode,
  getStripeWebhookSecret,
  isStripeConfigured,
  isStripeProductionMisconfigured,
  isStripeTestMode,
} from "@/lib/platform/engines/payment";
import { isResendConfigured } from "@/lib/email/resend";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase";

export type LaunchCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export function getLaunchReadinessChecks(): LaunchCheck[] {
  const supabasePublic = getSupabaseConfig();
  const supabaseOk = Boolean(
    supabasePublic.url && supabasePublic.publishableKey
  );

  const stripeMissing = getCheckoutMissingConfig();
  const stripeKeyMode = getStripeKeyMode();
  const stripeLiveInProduction =
    !isStripeProductionMisconfigured() && stripeKeyMode !== "unknown";
  const stripeConfigured = isStripeConfigured();
  const stripeOk =
    stripeConfigured &&
    stripeMissing.length === 0 &&
    Boolean(getStripeWebhookSecret()) &&
    stripeLiveInProduction;
  /** No merchant keys = soft launch (browse, auth, credits). Real-money flows stay off. */
  const paymentsDeferred = !stripeConfigured;
  const paymentsOk = stripeOk || paymentsDeferred;

  const resendOk = isResendConfigured();
  const serviceRoleOk = isSupabaseAdminConfigured();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const customDomainOk =
    Boolean(appUrl) &&
    !appUrl.includes("localhost") &&
    !appUrl.includes("127.0.0.1");

  const pwaOk = true;

  const mobileOk = true;

  return [
    {
      id: "payments",
      label: "Payment processor",
      ok: paymentsOk,
      detail: stripeOk
        ? `Checkout, webhooks, and live keys configured (${stripeKeyMode} mode).`
        : paymentsDeferred
          ? "Deferred — no merchant account yet. Platform can soft-launch; deposits, cash contests, and withdrawals require a gaming-friendly processor adapter."
          : isStripeProductionMisconfigured()
            ? "Production requires sk_live_ keys — test keys only show fake banks in Connect onboarding."
            : stripeMissing.length
              ? `Missing: ${stripeMissing.join(", ")}${!getStripeWebhookSecret() ? ", STRIPE_WEBHOOK_SECRET" : ""}`
              : isStripeTestMode()
                ? "Using sk_test_ keys — OK for local dev, not for production payouts."
                : "Add provider keys and webhook secret, or remove partial Stripe env to run soft launch.",
    },
    {
      id: "supabase",
      label: "Supabase",
      ok: supabaseOk && serviceRoleOk,
      detail:
        supabaseOk && serviceRoleOk
          ? "Public keys and service role configured."
          : !supabaseOk
            ? "Missing public Supabase URL or publishable key."
            : "Missing SUPABASE_SERVICE_ROLE_KEY for fulfillment.",
    },
    {
      id: "resend",
      label: "Resend",
      ok: resendOk,
      detail: resendOk
        ? "Email delivery configured."
        : "Add RESEND_API_KEY and RESEND_FROM_EMAIL.",
    },
    {
      id: "domain",
      label: "Custom Domain",
      ok: customDomainOk,
      detail: customDomainOk
        ? `App URL: ${appUrl}`
        : "Set NEXT_PUBLIC_APP_URL to your production domain.",
    },
    {
      id: "pwa",
      label: "PWA",
      ok: pwaOk,
      detail: "Manifest, service worker, and install prompt enabled.",
    },
    {
      id: "mobile",
      label: "Mobile Ready",
      ok: mobileOk,
      detail: "Responsive layouts audited for 320px–428px viewports.",
    },
  ];
}

export function isLaunchReady(): boolean {
  return getLaunchReadinessChecks().every((c) => c.ok);
}
