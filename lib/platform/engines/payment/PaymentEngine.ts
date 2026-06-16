import type {
  AuthorizeInput,
  CancelTransactionInput,
  CaptureInput,
  ChargeSavedMethodInput,
  CreatePayoutInput,
  DepositInput,
  DepositResult,
  DeletePaymentMethodInput,
  GetTransactionInput,
  PaymentProviderResult,
  ProcessWebhookInput,
  ProcessWebhookResult,
  RefundInput,
  SavePaymentMethodInput,
  VerifyIdentityInput,
  VerifyIdentityResult,
  VerifyBankInput,
  WithdrawInput,
} from "@/lib/platform/engines/payment/types";
import {
  orchestrateAuthorize,
  orchestrateCancelTransaction,
  orchestrateCapture,
  orchestrateCreateCustomer,
  orchestrateDeletePaymentMethod,
  orchestrateDeposit,
  orchestrateFastCheckout,
  orchestrateGetTransaction,
  orchestrateIsConnectEnabled,
  orchestrateIsConnectV2PayoutsEnabled,
  orchestratePayout,
  orchestrateRefund,
  orchestrateRetrieveCheckoutSession,
  orchestrateSavePaymentMethod,
  orchestrateVerifyIdentity,
  orchestrateWithdraw,
} from "@/lib/platform/engines/payment/orchestrator";
import { getPaymentAdapter } from "@/lib/platform/engines/payment/registry";
import { processPaymentWebhook } from "@/lib/platform/engines/payment/webhookService";
import {
  getCheckoutMissingConfig,
  getPaymentProviderId,
  isPaymentEngineConfigured,
} from "@/lib/platform/engines/payment/config";
import {
  createConnectAccountLink,
  createExpressConnectAccount,
} from "@/lib/platform/engines/payment/adapters/stripe/connect";
import {
  createWinnerConnectV2Account,
  createWinnerConnectV2AccountLink,
} from "@/lib/platform/engines/payment/adapters/stripe/connectV2Payouts";
import {
  diagnoseWinnerConnectV2Account,
  repairWinnerConnectV2Account,
} from "@/lib/platform/engines/payment/adapters/stripe/connectV2Diagnostics";
import type { PlayerConnectIdentityPrefill } from "@/lib/database/services/stripeConnect";
import type { PlayerConnectStatus } from "@/lib/platform/engines/payment/adapters/stripe/connectTypes";

export type { ConnectV2DiagnosticReport } from "@/lib/platform/engines/payment/adapters/stripe/connectV2Diagnostics";

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

  async withdraw(input: WithdrawInput): Promise<PaymentProviderResult> {
    return orchestrateWithdraw(input);
  }

  async authorize(input: AuthorizeInput): Promise<PaymentProviderResult> {
    return orchestrateAuthorize(input);
  }

  async capture(input: CaptureInput): Promise<PaymentProviderResult> {
    return orchestrateCapture(input);
  }

  async refund(input: RefundInput & { playerEmail?: string }): Promise<PaymentProviderResult> {
    return orchestrateRefund(input);
  }

  async createPayout(input: CreatePayoutInput): Promise<PaymentProviderResult> {
    return orchestratePayout(input);
  }

  async verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult> {
    return orchestrateVerifyIdentity(input);
  }

  async verifyBank(input: VerifyBankInput) {
    assertConfiguredAdapter();
    return getPaymentAdapter().verifyBank(input);
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<PaymentProviderResult> {
    return orchestrateSavePaymentMethod(input);
  }

  async deletePaymentMethod(input: DeletePaymentMethodInput): Promise<PaymentProviderResult> {
    return orchestrateDeletePaymentMethod(input);
  }

  async processWebhook(input: ProcessWebhookInput): Promise<ProcessWebhookResult> {
    return processPaymentWebhook(input);
  }

  async getTransaction(input: GetTransactionInput): Promise<PaymentProviderResult> {
    return orchestrateGetTransaction(input);
  }

  async cancelTransaction(input: CancelTransactionInput): Promise<PaymentProviderResult> {
    return orchestrateCancelTransaction(input);
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

  /** Stripe Connect v2 — admin diagnostics (provider transport only). */
  async diagnoseConnectAccount(input: {
    accountId: string;
    playerEmail?: string | null;
    dbStatus?: PlayerConnectStatus | null;
  }) {
    return diagnoseWinnerConnectV2Account(input);
  }

  async repairConnectAccount(accountId: string, prefill?: PlayerConnectIdentityPrefill) {
    return repairWinnerConnectV2Account(accountId, prefill);
  }

  /** Connect onboarding helpers — routes through active adapter layer. */
  async createConnectExpressAccount(email: string) {
    return createExpressConnectAccount(email);
  }

  async createConnectV2WinnerAccount(input: {
    email: string;
    displayName: string;
    prefill?: PlayerConnectIdentityPrefill;
  }) {
    return createWinnerConnectV2Account(input);
  }

  async createConnectOnboardingLink(input: {
    accountId: string;
    useV2: boolean;
    linkType?: "account_onboarding" | "account_update";
    prefill?: PlayerConnectIdentityPrefill;
  }): Promise<string> {
    if (input.useV2) {
      return createWinnerConnectV2AccountLink({
        accountId: input.accountId,
        prefill: input.prefill,
      });
    }

    const link = await createConnectAccountLink(
      input.accountId,
      input.linkType ?? "account_onboarding"
    );
    if (!link.url) throw new Error("Connect onboarding URL missing.");
    return link.url;
  }
}

function assertConfiguredAdapter(): void {
  const adapter = getPaymentAdapter();
  if (!adapter.isConfigured()) {
    throw new Error("Payment provider not configured.");
  }
}

export const PaymentEngine = new PaymentEngineService();

/** Directive aliases for integration sites. */
export const createPaymentCustomer = (email: string) => PaymentEngine.createCustomer(email);
export const startDepositCheckout = (input: DepositInput) => PaymentEngine.deposit(input);
export const chargeFastCheckout = PaymentEngine.fastCheckout.bind(PaymentEngine);
export const sendPrizePayout = (input: CreatePayoutInput) => PaymentEngine.createPayout(input);
