export type StripeKeyMode = "test" | "live" | "unknown";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

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

export function isStripeProductionMisconfigured(): boolean {
  return isProductionDeployment() && isStripeTestMode();
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export { getAppUrl } from "@/lib/platform/engines/payment/config";
