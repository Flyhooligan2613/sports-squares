export type StripeKeyMode = "test" | "live" | "unknown";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Derived from STRIPE_SECRET_KEY prefix — test keys always show fake banks in Connect onboarding. */
export function getStripeKeyMode(): StripeKeyMode {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return "unknown";
}

export function isStripeTestMode(): boolean {
  return getStripeKeyMode() === "test";
}

export function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.VERCEL_ENV === "preview") return false;
  return process.env.NODE_ENV === "production";
}

/** Production must use sk_live_ — Financial Connections only lists real banks in live mode. */
export function isStripeProductionMisconfigured(): boolean {
  return isProductionDeployment() && isStripeTestMode();
}

export function getCheckoutMissingConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
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

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  // Local dev should always stay on localhost when configured.
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
