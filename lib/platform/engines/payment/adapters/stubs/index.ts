import { PaymentError } from "@/lib/platform/engines/payment/errors";
import type { PaymentProvider, PaymentProviderId } from "@/lib/platform/engines/payment/types";

function notImplemented(id: PaymentProviderId): PaymentProvider {
  const throwNotImplemented = () => {
    throw new PaymentError("provider_not_implemented", `${id} adapter is not implemented yet.`);
  };

  const stubResult = async () => ({
    ok: false as const,
    provider: id,
    providerTransactionId: null,
    status: "failed" as const,
    amountCents: 0,
    currency: "usd",
    error: new PaymentError("provider_not_implemented").toPayload(),
  });

  return {
    id,
    isConfigured: () => false,
    createCustomer: async () => ({ ...(await stubResult()), customerId: "" }),
    deposit: stubResult,
    withdraw: stubResult,
    authorize: stubResult,
    capture: stubResult,
    refund: stubResult,
    createPayout: stubResult,
    verifyIdentity: async () => ({
      ...(await stubResult()),
      accountId: undefined,
      onboardingUrl: undefined,
    }),
    verifyBank: stubResult,
    savePaymentMethod: stubResult,
    deletePaymentMethod: stubResult,
    processWebhook: async () => ({ handled: false }),
    getTransaction: stubResult,
    cancelTransaction: stubResult,
    chargeSavedMethod: throwNotImplemented as never,
    syncWalletFromCheckout: throwNotImplemented as never,
    retrieveCheckoutSession: throwNotImplemented as never,
  };
}

export const futureGamingProviderAdapter = notImplemented("future_gaming");
export const futureFantasySportsAdapter = notImplemented("future_fantasy_sports");
export const futureACHProviderAdapter = notImplemented("future_ach");
export const futureBankTransferAdapter = notImplemented("future_bank_transfer");
export const futureApplePayAdapter = notImplemented("future_apple_pay");
export const futureGooglePayAdapter = notImplemented("future_google_pay");
export const futureCryptoAdapter = notImplemented("future_crypto");
