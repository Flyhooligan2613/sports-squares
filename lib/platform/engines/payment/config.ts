import type { PaymentProviderId } from "@/lib/platform/engines/payment/types";

const VALID_PROVIDERS: PaymentProviderId[] = [
  "stripe",
  "future_gaming",
  "future_fantasy_sports",
  "future_ach",
];

/** Active payment provider — swap adapters without code changes. */
export function getPaymentProviderId(): PaymentProviderId {
  const raw = (process.env.PAYMENT_PROVIDER ?? "stripe").trim().toLowerCase();
  if (VALID_PROVIDERS.includes(raw as PaymentProviderId)) {
    return raw as PaymentProviderId;
  }
  return "stripe";
}

export function isPaymentEngineConfigured(): boolean {
  const provider = getPaymentProviderId();
  if (provider === "stripe") {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
  return false;
}

export function getCheckoutMissingConfig(): string[] {
  const missing: string[] = [];
  const provider = getPaymentProviderId();

  if (provider === "stripe" && !process.env.STRIPE_SECRET_KEY) {
    missing.push("STRIPE_SECRET_KEY");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return missing;
}

/** Platform app URL — used for redirects, invites, webhooks (provider-agnostic). */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (process.env.NODE_ENV === "development" && configured?.includes("localhost")) {
    return configured;
  }

  if (configured && !configured.includes("localhost")) return configured;

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (configured) return configured;

  return "http://localhost:3000";
}
