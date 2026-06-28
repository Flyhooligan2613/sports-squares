import type {
  AuthorizeInput,
  CancelTransactionInput,
  CaptureInput,
  ChargeSavedMethodInput,
  CreateCustomerInput,
  CreateCustomerResult,
  CreatePayoutInput,
  DeletePaymentMethodInput,
  DepositInput,
  DepositResult,
  GetTransactionInput,
  PaymentProvider,
  PaymentProviderResult,
  ProcessWebhookInput,
  ProcessWebhookResult,
  RefundInput,
  SavePaymentMethodInput,
  VerifyBankInput,
  VerifyIdentityInput,
  VerifyIdentityResult,
  WithdrawInput,
} from "@/lib/platform/engines/payment/types";
import { PaymentError, paymentErrorFromUnknown } from "@/lib/platform/engines/payment/errors";
import { getStripe } from "@/lib/platform/engines/payment/adapters/stripe/client";
import {
  isStripeConfigured,
  isStripeProductionMisconfigured,
} from "@/lib/platform/engines/payment/adapters/stripe/config";
import {
  createConnectTransfer,
  isStripeConnectEnabled,
  isStripeConnectV2PayoutsEnabled,
} from "@/lib/platform/engines/payment/adapters/stripe/connect";
import {
  chargeSavedPaymentMethod,
  getOrCreateStripeCustomer,
  getPlayerWallet,
  savePlayerPaymentMethod,
  syncPlayerWalletFromCheckoutSession,
} from "@/lib/platform/engines/payment/adapters/stripe/playerWallet";
import {
  constructStripeWebhookEvent,
  dispatchStripeWebhookEvent,
} from "@/lib/platform/engines/payment/adapters/stripe/webhookHandlers";
import {
  createWinnerConnectV2Account,
  createWinnerConnectV2AccountLink,
} from "@/lib/platform/engines/payment/adapters/stripe/connectV2Payouts";
import {
  createConnectAccountLink,
  createExpressConnectAccount,
} from "@/lib/platform/engines/payment/adapters/stripe/connect";
import { normalizeEmail } from "@/lib/player/statsCore";

function baseResult(
  partial: Partial<PaymentProviderResult> & Pick<PaymentProviderResult, "ok" | "status" | "amountCents">
): PaymentProviderResult {
  return {
    provider: "stripe",
    providerTransactionId: null,
    currency: "usd",
    ...partial,
  };
}

export class StripeAdapter implements PaymentProvider {
  readonly id = "stripe" as const;

  isConfigured(): boolean {
    return isStripeConfigured();
  }

  async createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult> {
    try {
      const customerId = await getOrCreateStripeCustomer(input.email);
      return {
        ok: true,
        provider: "stripe",
        customerId,
        providerTransactionId: customerId,
        status: "completed",
        amountCents: 0,
        currency: "usd",
      };
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return {
        ok: false,
        provider: "stripe",
        customerId: "",
        providerTransactionId: null,
        status: "failed",
        amountCents: 0,
        currency: "usd",
        error: pe.toPayload(),
      };
    }
  }

  async deposit(input: DepositInput): Promise<DepositResult> {
    try {
      const customerId = await getOrCreateStripeCustomer(input.email);
      const stripe = getStripe();

      const lineItems = input.lineItems?.length
        ? input.lineItems.map((item) => ({
            price_data: {
              currency: input.currency ?? "usd",
              unit_amount: item.unitAmountCents,
              product_data: {
                name: item.name,
                description: item.description,
              },
            },
            quantity: item.quantity,
          }))
        : [
            {
              price_data: {
                currency: input.currency ?? "usd",
                unit_amount: input.amountCents,
                product_data: { name: input.description },
              },
              quantity: 1,
            },
          ];

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: lineItems,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        billing_address_collection: "required",
        payment_intent_data: input.setupFutureUsage
          ? { setup_future_usage: "off_session" }
          : undefined,
        metadata: {
          email: normalizeEmail(input.email),
          ...input.metadata,
        },
      });

      if (!session.url || !session.id) {
        throw new PaymentError("checkout_failed");
      }

      return {
        ok: true,
        provider: "stripe",
        providerTransactionId: session.id,
        status: "pending",
        amountCents: input.amountCents,
        currency: input.currency ?? "usd",
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (err) {
      const pe = paymentErrorFromUnknown(err, "checkout_failed");
      return {
        ok: false,
        provider: "stripe",
        providerTransactionId: null,
        status: "failed",
        amountCents: input.amountCents,
        currency: input.currency ?? "usd",
        error: pe.toPayload(),
      };
    }
  }

  async chargeSavedMethod(input: ChargeSavedMethodInput): Promise<PaymentProviderResult> {
    try {
      const pi = await chargeSavedPaymentMethod({
        email: input.email,
        amountCents: input.amountCents,
        description: input.description,
        metadata: input.metadata ?? {},
      });

      const succeeded = pi.status === "succeeded";
      return baseResult({
        ok: succeeded,
        providerTransactionId: pi.id,
        status: succeeded ? "completed" : "failed",
        amountCents: input.amountCents,
        metadata: pi.metadata as Record<string, string>,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents,
        error: pe.toPayload(),
      });
    }
  }

  async withdraw(_input: WithdrawInput): Promise<PaymentProviderResult> {
    return baseResult({
      ok: false,
      status: "failed",
      amountCents: _input.amountCents,
      error: new PaymentError("provider_not_implemented").toPayload(),
    });
  }

  async authorize(input: AuthorizeInput): Promise<PaymentProviderResult> {
    try {
      const wallet = await getPlayerWallet(input.email);
      if (!wallet.stripeCustomerId) {
        throw new PaymentError("customer_not_found");
      }

      const stripe = getStripe();
      const pi = await stripe.paymentIntents.create({
        amount: input.amountCents,
        currency: input.currency ?? "usd",
        customer: wallet.stripeCustomerId,
        capture_method: "manual",
        description: input.description,
        metadata: input.metadata,
      });

      return baseResult({
        ok: true,
        providerTransactionId: pi.id,
        status: "authorized",
        amountCents: input.amountCents,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents,
        error: pe.toPayload(),
      });
    }
  }

  async capture(input: CaptureInput): Promise<PaymentProviderResult> {
    try {
      const stripe = getStripe();
      const pi = await stripe.paymentIntents.capture(input.providerTransactionId, {
        amount_to_capture: input.amountCents,
      });

      return baseResult({
        ok: pi.status === "succeeded",
        providerTransactionId: pi.id,
        status: pi.status === "succeeded" ? "captured" : "failed",
        amountCents: pi.amount_received ?? input.amountCents ?? 0,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents ?? 0,
        error: pe.toPayload(),
      });
    }
  }

  async refund(input: RefundInput): Promise<PaymentProviderResult> {
    try {
      const stripe = getStripe();
      const refund = await stripe.refunds.create({
        payment_intent: input.providerTransactionId,
        amount: input.amountCents,
        reason: input.reason as "duplicate" | "fraudulent" | "requested_by_customer" | undefined,
      });

      return baseResult({
        ok: refund.status === "succeeded" || refund.status === "pending",
        providerTransactionId: refund.id,
        status: "refunded",
        amountCents: refund.amount ?? input.amountCents ?? 0,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err, "refund_failed");
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents ?? 0,
        error: pe.toPayload(),
      });
    }
  }

  async createPayout(input: CreatePayoutInput): Promise<PaymentProviderResult> {
    if (!isStripeConnectEnabled()) {
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents,
        error: new PaymentError("provider_not_configured", "Stripe Connect payouts not enabled.").toPayload(),
      });
    }

    try {
      const transfer = await createConnectTransfer({
        amountCents: input.amountCents,
        destinationAccountId: input.destinationAccountId,
        idempotencyKey: input.idempotencyKey,
        metadata: {
          email: normalizeEmail(input.email),
          ...input.metadata,
        },
      });

      return baseResult({
        ok: true,
        providerTransactionId: transfer.id,
        status: "completed",
        amountCents: input.amountCents,
        metadata: transfer.metadata as Record<string, string>,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err, "payout_failed");
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: input.amountCents,
        error: pe.toPayload(),
      });
    }
  }

  async verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult> {
    if (!isStripeConnectEnabled()) {
      return {
        ok: false,
        provider: "stripe",
        providerTransactionId: null,
        status: "failed",
        amountCents: 0,
        currency: "usd",
        error: new PaymentError("provider_not_configured").toPayload(),
      };
    }

    if (isStripeProductionMisconfigured()) {
      return {
        ok: false,
        provider: "stripe",
        providerTransactionId: null,
        status: "failed",
        amountCents: 0,
        currency: "usd",
        error: new PaymentError(
          "provider_not_configured",
          "Production is using Stripe test keys."
        ).toPayload(),
      };
    }

    try {
      const email = normalizeEmail(input.email);
      const displayName = input.displayName ?? email;

      if (isStripeConnectV2PayoutsEnabled()) {
        const account = await createWinnerConnectV2Account({
          email,
          displayName,
        });
        const url = await createWinnerConnectV2AccountLink({ accountId: account.id });
        return {
          ok: true,
          provider: "stripe",
          providerTransactionId: account.id,
          status: "pending",
          amountCents: 0,
          currency: "usd",
          onboardingUrl: url,
          accountId: account.id,
        };
      }

      const account = await createExpressConnectAccount(email);
      const link = await createConnectAccountLink(account.id);
      return {
        ok: true,
        provider: "stripe",
        providerTransactionId: account.id,
        status: "pending",
        amountCents: 0,
        currency: "usd",
        onboardingUrl: link.url ?? undefined,
        accountId: account.id,
      };
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return {
        ok: false,
        provider: "stripe",
        providerTransactionId: null,
        status: "failed",
        amountCents: 0,
        currency: "usd",
        error: pe.toPayload(),
      };
    }
  }

  async verifyBank(_input: VerifyBankInput): Promise<PaymentProviderResult> {
    return baseResult({
      ok: false,
      status: "failed",
      amountCents: 0,
      error: new PaymentError(
        "identity_verification_required",
        "Bank verification is handled during Connect onboarding."
      ).toPayload(),
    });
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<PaymentProviderResult> {
    try {
      await savePlayerPaymentMethod({
        email: input.email,
        stripeCustomerId: input.customerId,
        paymentMethodId: input.paymentMethodId,
      });
      return baseResult({
        ok: true,
        providerTransactionId: input.paymentMethodId,
        status: "completed",
        amountCents: 0,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: 0,
        error: pe.toPayload(),
      });
    }
  }

  async deletePaymentMethod(input: DeletePaymentMethodInput): Promise<PaymentProviderResult> {
    try {
      const stripe = getStripe();
      await stripe.paymentMethods.detach(input.paymentMethodId);
      return baseResult({
        ok: true,
        providerTransactionId: input.paymentMethodId,
        status: "completed",
        amountCents: 0,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: 0,
        error: pe.toPayload(),
      });
    }
  }

  async processWebhook(input: ProcessWebhookInput): Promise<ProcessWebhookResult> {
    if (!input.signature) {
      return { handled: false };
    }

    try {
      const event = await constructStripeWebhookEvent(input.body, input.signature);
      const { recordWebhookEvent } = await import("@/lib/purchases/ledger");
      const dedup = await recordWebhookEvent(event.id, event.type);

      if (dedup === "duplicate") {
        return {
          handled: true,
          eventType: event.type,
          eventId: event.id,
          duplicate: true,
        };
      }

      await dispatchStripeWebhookEvent(event);

      return {
        handled: true,
        eventType: event.type,
        eventId: event.id,
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes("signature")) {
        throw new PaymentError("webhook_invalid_signature", err.message);
      }
      throw paymentErrorFromUnknown(err, "webhook_handler_failed");
    }
  }

  async getTransaction(input: GetTransactionInput): Promise<PaymentProviderResult> {
    try {
      const stripe = getStripe();
      const pi = await stripe.paymentIntents.retrieve(input.providerTransactionId);
      const status =
        pi.status === "succeeded"
          ? "completed"
          : pi.status === "canceled"
            ? "cancelled"
            : pi.status === "requires_capture"
              ? "authorized"
              : "pending";

      return baseResult({
        ok: pi.status === "succeeded",
        providerTransactionId: pi.id,
        status,
        amountCents: pi.amount,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err, "transaction_not_found");
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: 0,
        error: pe.toPayload(),
      });
    }
  }

  async cancelTransaction(input: CancelTransactionInput): Promise<PaymentProviderResult> {
    try {
      const stripe = getStripe();
      const pi = await stripe.paymentIntents.cancel(input.providerTransactionId);
      return baseResult({
        ok: true,
        providerTransactionId: pi.id,
        status: "cancelled",
        amountCents: pi.amount,
      });
    } catch (err) {
      const pe = paymentErrorFromUnknown(err);
      return baseResult({
        ok: false,
        status: "failed",
        amountCents: 0,
        error: pe.toPayload(),
      });
    }
  }

  async syncWalletFromCheckout(sessionId: string): Promise<void> {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await syncPlayerWalletFromCheckoutSession(session);
  }

  async retrieveCheckoutSession(sessionId: string) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === "paid",
      metadata: (session.metadata ?? {}) as Record<string, string>,
      amountCents: session.amount_total ?? 0,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    };
  }

  isConnectEnabled(): boolean {
    return isStripeConnectEnabled();
  }

  isConnectV2PayoutsEnabled(): boolean {
    return isStripeConnectV2PayoutsEnabled();
  }
}

export const stripeAdapter = new StripeAdapter();
