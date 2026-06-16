import type {
  ChargeSavedMethodInput,
  CreatePayoutInput,
  DepositInput,
  DepositResult,
  PaymentProviderResult,
  VerifyIdentityInput,
  VerifyIdentityResult,
} from "@/lib/platform/engines/payment/types";
import { getPaymentAdapter } from "@/lib/platform/engines/payment/registry";
import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { PaymentError } from "@/lib/platform/engines/payment/errors";

function assertConfigured(): void {
  const adapter = getPaymentAdapter();
  if (!adapter.isConfigured()) {
    throw new PaymentError("provider_not_configured");
  }
}

export async function orchestrateDeposit(input: DepositInput): Promise<DepositResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.deposit(input);

  try {
    await recordPaymentTransaction({
      playerEmail: input.email,
      contestId: input.metadata?.contestId ?? null,
      poolId: input.metadata?.poolId ?? null,
      provider: adapter.id,
      providerTransactionId: result.sessionId ?? result.providerTransactionId,
      transactionType: input.metadata?.contestId ? "contest_entry" : "deposit",
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      status: result.ok ? "pending" : "failed",
      idempotencyKey: result.sessionId ?? undefined,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "deposit_initiated",
      auditDetail: input.description,
    });
  } catch (err) {
    console.error("[PaymentEngine] transaction record failed", err);
  }

  return result;
}

export async function orchestrateFastCheckout(
  input: ChargeSavedMethodInput & {
    contestId?: string;
    poolId?: string;
    idempotencyKey?: string;
  }
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();

  if (!adapter.chargeSavedMethod) {
    throw new PaymentError("provider_not_implemented", "Fast checkout not supported.");
  }

  const result = await adapter.chargeSavedMethod(input);

  try {
    await recordPaymentTransaction({
      playerEmail: input.email,
      contestId: input.contestId ?? input.metadata?.contestId ?? null,
      poolId: input.poolId ?? input.metadata?.poolId ?? null,
      provider: adapter.id,
      providerTransactionId: result.providerTransactionId,
      paymentMethodType: "card",
      transactionType: input.contestId || input.metadata?.contestId ? "contest_entry" : "deposit",
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      status: result.ok ? "completed" : "failed",
      idempotencyKey: input.idempotencyKey ?? result.providerTransactionId ?? undefined,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "fast_checkout",
      auditDetail: input.description,
    });
  } catch (err) {
    console.error("[PaymentEngine] transaction record failed", err);
  }

  return result;
}

export async function orchestratePayout(
  input: CreatePayoutInput
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.createPayout(input);

  try {
    await recordPaymentTransaction({
      playerEmail: input.email,
      contestId: input.metadata?.contest_id ?? input.metadata?.contestId ?? null,
      poolId: input.metadata?.pool_id ?? input.metadata?.poolId ?? null,
      provider: adapter.id,
      providerTransactionId: result.providerTransactionId,
      transactionType: "prize_payout",
      amountCents: input.amountCents,
      status: result.ok ? "completed" : "failed",
      idempotencyKey: input.idempotencyKey,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "payout",
      auditDetail: input.metadata?.quarter ?? input.metadata?.game,
    });
  } catch (err) {
    console.error("[PaymentEngine] transaction record failed", err);
  }

  return result;
}

export async function orchestrateVerifyIdentity(
  input: VerifyIdentityInput
): Promise<VerifyIdentityResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  return adapter.verifyIdentity(input);
}

export async function orchestrateCreateCustomer(email: string): Promise<string> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.createCustomer({ email });
  if (!result.ok) {
    throw new PaymentError(
      (result.error?.code as "unknown") ?? "customer_not_found",
      result.error?.message
    );
  }
  return result.customerId;
}

export async function orchestrateRetrieveCheckoutSession(sessionId: string) {
  const adapter = getPaymentAdapter();
  if (!adapter.retrieveCheckoutSession) return null;
  return adapter.retrieveCheckoutSession(sessionId);
}

export function orchestrateIsConnectEnabled(): boolean {
  const adapter = getPaymentAdapter();
  return adapter.isConnectEnabled?.() ?? false;
}

export function orchestrateIsConnectV2PayoutsEnabled(): boolean {
  const adapter = getPaymentAdapter();
  return adapter.isConnectV2PayoutsEnabled?.() ?? false;
}
