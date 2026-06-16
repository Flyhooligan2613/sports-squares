import type { PaymentProvider, PaymentProviderId } from "@/lib/platform/engines/payment/types";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import { stripeAdapter } from "@/lib/platform/engines/payment/adapters/stripe/StripeAdapter";
import {
  futureACHProviderAdapter,
  futureFantasySportsAdapter,
  futureGamingProviderAdapter,
} from "@/lib/platform/engines/payment/adapters/stubs";

const adapters = new Map<PaymentProviderId, PaymentProvider>([
  ["stripe", stripeAdapter],
  ["future_gaming", futureGamingProviderAdapter],
  ["future_fantasy_sports", futureFantasySportsAdapter],
  ["future_ach", futureACHProviderAdapter],
]);

export function registerPaymentAdapter(
  id: PaymentProviderId,
  adapter: PaymentProvider
): void {
  adapters.set(id, adapter);
}

export function getPaymentAdapter(id?: PaymentProviderId): PaymentProvider {
  const providerId = id ?? getPaymentProviderId();
  const adapter = adapters.get(providerId);
  if (!adapter) {
    return stripeAdapter;
  }
  return adapter;
}

export function listPaymentAdapters(): PaymentProviderId[] {
  return Array.from(adapters.keys());
}
