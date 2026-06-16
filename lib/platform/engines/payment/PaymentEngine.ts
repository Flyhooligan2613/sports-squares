import type {
  ChargeSavedMethodInput,
  CreatePayoutInput,
  DepositInput,
  DepositResult,
  PaymentProviderResult,
  VerifyIdentityInput,
  VerifyIdentityResult,
} from "@/lib/platform/engines/payment/types";
import {
  orchestrateCreateCustomer,
  orchestrateDeposit,
  orchestrateFastCheckout,
  orchestrateIsConnectEnabled,
  orchestrateIsConnectV2PayoutsEnabled,
  orchestratePayout,
  orchestrateRetrieveCheckoutSession,
  orchestrateVerifyIdentity,
} from "@/lib/platform/engines/payment/orchestrator";
import { getPaymentAdapter } from "@/lib/platform/engines/payment/registry";
import { processPaymentWebhook } from "@/lib/platform/engines/payment/webhookService";
import type { ProcessWebhookInput, ProcessWebhookResult } from "@/lib/platform/engines/payment/types";
import {
  getCheckoutMissingConfig,
  getPaymentProviderId,
  isPaymentEngineConfigured,
} from "@/lib/platform/engines/payment/config";

/**
 * PaymentEngine™ — orchestrates deposits, withdrawals, contest entries,
 * prize payouts, refunds, and wallet transfers via configured provider adapter.
 */
class PaymentEngineService {
  getProviderId() {
    return getPaymentProviderId();
  }

  isConfigured(): boolean {
    return isPaymentEngineConfigured();
  }

  getMissingConfig(): string[] {
    return getCheckoutMissingConfig();
  }

  getAdapter() {
    return getPaymentAdapter();
  }

  async createCustomer(email: string): Promise<string> {
    return orchestrateCreateCustomer(email);
  }

  async deposit(input: DepositInput): Promise<DepositResult> {
    return orchestrateDeposit(input);
  }

  async fastCheckout(
    input: ChargeSavedMethodInput & { contestId?: string; poolId?: string; idempotencyKey?: string }
  ): Promise<PaymentProviderResult> {
    return orchestrateFastCheckout(input);
  }

  async createPayout(input: CreatePayoutInput): Promise<PaymentProviderResult> {
    return orchestratePayout(input);
  }

  async verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult> {
    return orchestrateVerifyIdentity(input);
  }

  async processWebhook(input: ProcessWebhookInput): Promise<ProcessWebhookResult> {
    return processPaymentWebhook(input);
  }

  async retrieveCheckoutSession(sessionId: string) {
    return orchestrateRetrieveCheckoutSession(sessionId);
  }

  isConnectEnabled(): boolean {
    return orchestrateIsConnectEnabled();
  }

  isConnectV2PayoutsEnabled(): boolean {
    return orchestrateIsConnectV2PayoutsEnabled();
  }
}

export const PaymentEngine = new PaymentEngineService();

/** Directive aliases for integration sites. */
export const createPaymentCustomer = (email: string) => PaymentEngine.createCustomer(email);
export const startDepositCheckout = (input: DepositInput) => PaymentEngine.deposit(input);
export const chargeFastCheckout = PaymentEngine.fastCheckout.bind(PaymentEngine);
export const sendPrizePayout = (input: CreatePayoutInput) => PaymentEngine.createPayout(input);
