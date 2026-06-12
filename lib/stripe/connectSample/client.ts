import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe/connectSample/config";

/**
 * Single Stripe Client used for ALL Connect sample requests.
 * The SDK automatically pins the API version (2026-05-27.dahlia on latest stripe@22).
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    // STRIPE_SECRET_KEY — replace via env; never hardcode secrets.
    stripeClient = new Stripe(getStripeSecretKey());
  }
  return stripeClient;
}

/** Reset client (tests only) */
export function resetStripeClientForTests(): void {
  stripeClient = null;
}
