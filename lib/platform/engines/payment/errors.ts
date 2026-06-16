import type { PaymentProviderErrorPayload } from "@/lib/platform/engines/payment/types";

export type PaymentErrorCode =
  | "provider_not_configured"
  | "provider_not_implemented"
  | "customer_not_found"
  | "payment_method_missing"
  | "account_suspended"
  | "insufficient_funds"
  | "payout_account_required"
  | "identity_verification_required"
  | "webhook_invalid_signature"
  | "webhook_handler_failed"
  | "transaction_not_found"
  | "checkout_failed"
  | "refund_failed"
  | "payout_failed"
  | "unknown";

const USER_MESSAGES: Record<PaymentErrorCode, string> = {
  provider_not_configured:
    "Payments are temporarily unavailable. Please try again later.",
  provider_not_implemented:
    "This payment option is not available yet. Contact support@squareboards.pro.",
  customer_not_found:
    "We could not find your payment profile. Please sign in and try again.",
  payment_method_missing:
    "Add a payment method on your profile before using fast checkout.",
  account_suspended:
    "This account is temporarily suspended. Contact support@squareboards.pro.",
  insufficient_funds:
    "Payment could not be completed. Check your payment method and try again.",
  payout_account_required:
    "Set up your cash-out account on Contest Winnings before entering contests.",
  identity_verification_required:
    "Complete identity verification to continue.",
  webhook_invalid_signature: "Invalid webhook signature.",
  webhook_handler_failed: "Webhook processing failed.",
  transaction_not_found: "Transaction not found.",
  checkout_failed: "Could not start checkout. Please try again.",
  refund_failed: "Refund could not be processed.",
  payout_failed: "Payout could not be completed. We will retry automatically.",
  unknown: "Something went wrong with your payment. Please try again.",
};

export class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  readonly retryable: boolean;
  readonly userMessage: string;

  constructor(
    code: PaymentErrorCode,
    message?: string,
    options?: { retryable?: boolean; userMessage?: string }
  ) {
    const resolvedMessage = message ?? USER_MESSAGES[code];
    super(resolvedMessage);
    this.name = "PaymentError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.userMessage = options?.userMessage ?? USER_MESSAGES[code];
  }

  toPayload(): PaymentProviderErrorPayload {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      userMessage: this.userMessage,
    };
  }
}

export function paymentErrorFromUnknown(err: unknown, fallback: PaymentErrorCode = "unknown"): PaymentError {
  if (err instanceof PaymentError) return err;

  if (err instanceof Error) {
    if (err.message.includes("suspended")) {
      return new PaymentError("account_suspended", err.message);
    }
    if (err.message.includes("No saved payment method")) {
      return new PaymentError("payment_method_missing", err.message);
    }
    if (err.message.includes("not configured")) {
      return new PaymentError("provider_not_configured", err.message);
    }
    return new PaymentError(fallback, err.message);
  }

  return new PaymentError(fallback);
}

export function userMessageForCode(code: PaymentErrorCode): string {
  return USER_MESSAGES[code];
}
