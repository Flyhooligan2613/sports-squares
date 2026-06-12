import { requireEnv } from "@/lib/stripe/connectSample/errors";
import { getAppUrl } from "@/lib/stripe/config";

/** Platform secret key — sk_test_*** or sk_live_*** from Stripe Dashboard */
export function getStripeSecretKey(): string {
  return requireEnv(
    "STRIPE_SECRET_KEY",
    "Add it from https://dashboard.stripe.com/apikeys"
  );
}

/** Standard webhook secret for subscription + checkout events (whsec_***) */
export function getSubscriptionWebhookSecret(): string | undefined {
  return process.env.STRIPE_CONNECT_SAMPLE_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim();
}

/** Thin webhook secret for V2 account requirement events (whsec_***) */
export function getThinWebhookSecret(): string | undefined {
  return process.env.STRIPE_CONNECT_SAMPLE_THIN_WEBHOOK_SECRET?.trim();
}

/**
 * Subscription price ID for the platform SaaS plan (price_***).
 * Create in Stripe Dashboard → Products, then paste here.
 */
export function getSubscriptionPriceId(): string {
  return requireEnv(
    "STRIPE_CONNECT_SAMPLE_SUBSCRIPTION_PRICE_ID",
    "Create a recurring Price in Stripe Dashboard and set STRIPE_CONNECT_SAMPLE_SUBSCRIPTION_PRICE_ID=price_***"
  );
}

/** Application fee in cents collected on each direct charge (default 123 = $1.23) */
export function getApplicationFeeCents(): number {
  const raw = process.env.STRIPE_CONNECT_SAMPLE_APP_FEE_CENTS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 123;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 123;
}

export function getConnectSampleBaseUrl(): string {
  return `${getAppUrl()}/connect-sample`;
}

/** Prefer the browser origin so Stripe onboarding returns to localhost during dev. */
export function getConnectSampleBaseUrlFromRequest(request: Request): string {
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  if (origin) return `${origin}/connect-sample`;

  const host = request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}/connect-sample`;
  }

  return getConnectSampleBaseUrl();
}

export function getStorefrontUrl(accountId: string): string {
  // In production, use your own slug or merchant identifier instead of raw account IDs.
  return `${getAppUrl()}/connect-sample/storefront/${accountId}`;
}
