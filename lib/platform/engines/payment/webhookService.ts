import { getPaymentAdapter } from "@/lib/platform/engines/payment/registry";
import type { ProcessWebhookInput, ProcessWebhookResult } from "@/lib/platform/engines/payment/types";
import { PaymentError } from "@/lib/platform/engines/payment/errors";

/** Centralized webhook processor — delegates to active provider adapter. */
export async function processPaymentWebhook(
  input: ProcessWebhookInput
): Promise<ProcessWebhookResult> {
  const adapter = getPaymentAdapter();

  if (!adapter.isConfigured()) {
    throw new PaymentError("provider_not_configured", "Webhook not configured.");
  }

  return adapter.processWebhook(input);
}
