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
  RefundInput,
  SavePaymentMethodInput,
  VerifyIdentityInput,
  VerifyIdentityResult,
  WithdrawInput,
} from "@/lib/platform/engines/payment/types";
import { getPaymentAdapter } from "@/lib/platform/engines/payment/registry";
import {
  getPaymentTransactionByProviderId,
  recordPaymentTransaction,
  updatePaymentTransactionStatus,
} from "@/lib/platform/engines/payment/TransactionCenter";
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

export async function orchestrateWithdraw(input: WithdrawInput): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.withdraw(input);

  try {
    await recordPaymentTransaction({
      playerEmail: input.email,
      provider: adapter.id,
      providerTransactionId: result.providerTransactionId,
      transactionType: "withdrawal",
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      status: result.ok ? "completed" : "failed",
      idempotencyKey: input.idempotencyKey,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "withdrawal",
    });
  } catch (err) {
    console.error("[PaymentEngine] transaction record failed", err);
  }

  return result;
}

export async function orchestrateAuthorize(input: AuthorizeInput): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.authorize(input);

  try {
    await recordPaymentTransaction({
      playerEmail: input.email,
      contestId: input.metadata?.contestId ?? null,
      poolId: input.metadata?.poolId ?? null,
      provider: adapter.id,
      providerTransactionId: result.providerTransactionId,
      transactionType: "authorization",
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      status: result.ok ? "authorized" : "failed",
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "authorize",
      auditDetail: input.description,
    });
  } catch (err) {
    console.error("[PaymentEngine] transaction record failed", err);
  }

  return result;
}

export async function orchestrateCapture(input: CaptureInput): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.capture(input);

  try {
    const existing = await getPaymentTransactionByProviderId(input.providerTransactionId);
    if (existing) {
      await updatePaymentTransactionStatus({
        id: existing.id,
        status: result.ok ? "captured" : "failed",
        providerTransactionId: result.providerTransactionId,
        errorCode: result.error?.code,
        errorMessage: result.error?.message,
        auditAction: "capture",
      });
    }
  } catch (err) {
    console.error("[PaymentEngine] transaction update failed", err);
  }

  return result;
}

export async function orchestrateRefund(input: RefundInput & { playerEmail?: string }): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.refund(input);

  try {
    const existing = await getPaymentTransactionByProviderId(input.providerTransactionId);
    await recordPaymentTransaction({
      playerEmail: input.playerEmail ?? existing?.playerEmail ?? "unknown@squareboards.pro",
      contestId: existing?.contestId ?? null,
      poolId: existing?.poolId ?? null,
      provider: adapter.id,
      providerTransactionId: result.providerTransactionId,
      transactionType: "refund",
      amountCents: result.amountCents,
      status: result.ok ? "refunded" : "failed",
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      auditAction: "refund",
    });

    if (existing && result.ok) {
      await updatePaymentTransactionStatus({
        id: existing.id,
        status: "refunded",
        auditAction: "refund_linked",
      });
    }
  } catch (err) {
    console.error("[PaymentEngine] refund transaction record failed", err);
  }

  return result;
}

export async function orchestrateSavePaymentMethod(
  input: SavePaymentMethodInput
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  return adapter.savePaymentMethod(input);
}

export async function orchestrateDeletePaymentMethod(
  input: DeletePaymentMethodInput
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  return adapter.deletePaymentMethod(input);
}

export async function orchestrateGetTransaction(
  input: GetTransactionInput
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  return adapter.getTransaction(input);
}

export async function orchestrateCancelTransaction(
  input: CancelTransactionInput
): Promise<PaymentProviderResult> {
  assertConfigured();
  const adapter = getPaymentAdapter();
  const result = await adapter.cancelTransaction(input);

  try {
    const existing = await getPaymentTransactionByProviderId(input.providerTransactionId);
    if (existing) {
      await updatePaymentTransactionStatus({
        id: existing.id,
        status: "cancelled",
        auditAction: "cancel",
      });
    }
  } catch (err) {
    console.error("[PaymentEngine] cancel transaction update failed", err);
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

/** Mark a checkout session transaction completed after webhook fulfillment. */
export async function orchestrateCheckoutSessionCompleted(input: {
  sessionId: string;
  paymentIntentId?: string | null;
  amountCents: number;
}): Promise<void> {
  try {
    const existing =
      (await getPaymentTransactionByProviderId(input.sessionId)) ??
      (input.paymentIntentId
        ? await getPaymentTransactionByProviderId(input.paymentIntentId)
        : null);

    if (existing) {
      await updatePaymentTransactionStatus({
        id: existing.id,
        status: "completed",
        providerTransactionId: input.paymentIntentId ?? input.sessionId,
        auditAction: "checkout_completed",
      });
      return;
    }

    const adapter = getPaymentAdapter();
    await recordPaymentTransaction({
      playerEmail: "unknown@squareboards.pro",
      provider: adapter.id,
      providerTransactionId: input.paymentIntentId ?? input.sessionId,
      transactionType: "contest_entry",
      amountCents: input.amountCents,
      status: "completed",
      idempotencyKey: input.sessionId,
      auditAction: "checkout_completed_webhook",
    });
  } catch (err) {
    console.error("[PaymentEngine] checkout completion record failed", err);
  }
}

/** Record refund from webhook after charge.refunded. */
export async function orchestrateWebhookRefund(input: {
  paymentIntentId: string;
  amountCents: number;
  sessionId?: string;
}): Promise<void> {
  try {
    const existing =
      (await getPaymentTransactionByProviderId(input.paymentIntentId)) ??
      (input.sessionId ? await getPaymentTransactionByProviderId(input.sessionId) : null);

    if (existing) {
      await updatePaymentTransactionStatus({
        id: existing.id,
        status: "refunded",
        auditAction: "charge_refunded",
      });
    }

    if (existing?.playerEmail) {
      await recordPaymentTransaction({
        playerEmail: existing.playerEmail,
        contestId: existing.contestId,
        poolId: existing.poolId,
        provider: existing.provider,
        providerTransactionId: input.paymentIntentId,
        transactionType: "refund",
        amountCents: input.amountCents,
        status: "refunded",
        idempotencyKey: `refund_${input.paymentIntentId}`,
        auditAction: "charge_refunded",
      });
    }
  } catch (err) {
    console.error("[PaymentEngine] webhook refund record failed", err);
  }
}
