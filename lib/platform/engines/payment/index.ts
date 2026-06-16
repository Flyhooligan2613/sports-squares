export type {
  PaymentProviderId,
  PaymentTransactionStatus,
  PaymentTransactionType,
  WalletBalanceType,
  PaymentMethodType,
  PaymentProviderResult,
  PaymentProviderErrorPayload,
  CreateCustomerInput,
  CreateCustomerResult,
  DepositInput,
  DepositResult,
  ChargeSavedMethodInput,
  WithdrawInput,
  AuthorizeInput,
  CaptureInput,
  RefundInput,
  CreatePayoutInput,
  VerifyIdentityInput,
  VerifyIdentityResult,
  VerifyBankInput,
  SavePaymentMethodInput,
  DeletePaymentMethodInput,
  ProcessWebhookInput,
  ProcessWebhookResult,
  GetTransactionInput,
  CancelTransactionInput,
  SquareWalletSummary,
  SquareWalletBalanceBreakdown,
  SquareWalletTransaction,
  PaymentTransactionRecord,
  PaymentAuditEntry,
  PaymentProvider,
} from "@/lib/platform/engines/payment/types";

export {
  PaymentError,
  paymentErrorFromUnknown,
  userMessageForCode,
} from "@/lib/platform/engines/payment/errors";
export type { PaymentErrorCode } from "@/lib/platform/engines/payment/errors";

export {
  getPaymentProviderId,
  isPaymentEngineConfigured,
  getCheckoutMissingConfig,
  getAppUrl,
} from "@/lib/platform/engines/payment/config";

export {
  registerPaymentAdapter,
  getPaymentAdapter,
  listPaymentAdapters,
} from "@/lib/platform/engines/payment/registry";

export {
  recordPaymentTransaction,
  updatePaymentTransactionStatus,
  getPaymentTransactionById,
  listPaymentTransactionsForPlayer,
  getPaymentTransactionByProviderId,
} from "@/lib/platform/engines/payment/TransactionCenter";
export type { RecordTransactionInput } from "@/lib/platform/engines/payment/TransactionCenter";

export {
  getSquareWallet,
  formatSquareWalletPaymentLabel,
  formatSavedPaymentLabelFromSquareWallet,
  getSquareWalletTransactionHistory,
  getSquareWalletProvider,
  getLegacyPlayerWalletSummary,
} from "@/lib/platform/engines/payment/SquareWallet";

export { processPaymentWebhook } from "@/lib/platform/engines/payment/webhookService";

export {
  orchestrateDeposit,
  orchestrateFastCheckout,
  orchestratePayout,
  orchestrateWithdraw,
  orchestrateAuthorize,
  orchestrateCapture,
  orchestrateRefund,
  orchestrateSavePaymentMethod,
  orchestrateDeletePaymentMethod,
  orchestrateGetTransaction,
  orchestrateCancelTransaction,
  orchestrateVerifyIdentity,
  orchestrateCreateCustomer,
  orchestrateRetrieveCheckoutSession,
  orchestrateIsConnectEnabled,
  orchestrateIsConnectV2PayoutsEnabled,
  orchestrateCheckoutSessionCompleted,
  orchestrateWebhookRefund,
} from "@/lib/platform/engines/payment/orchestrator";

export {
  PaymentEngine,
  createPaymentCustomer,
  startDepositCheckout,
  chargeFastCheckout,
  sendPrizePayout,
} from "@/lib/platform/engines/payment/PaymentEngine";

export { stripeAdapter } from "@/lib/platform/engines/payment/adapters/stripe/StripeAdapter";

export type { PlayerConnectStatus, ConnectOnboardResponse } from "@/lib/platform/engines/payment/adapters/stripe/connectTypes";

export {
  isStripeConfigured,
  isStripeTestMode,
  isStripeProductionMisconfigured,
  getStripeWebhookSecret,
  getStripeKeyMode,
} from "@/lib/platform/engines/payment/adapters/stripe/config";

export type { ConnectV2DiagnosticReport } from "@/lib/platform/engines/payment/adapters/stripe/connectV2Diagnostics";

export {
  isStripeConnectEnabled,
  isStripeConnectV2PayoutsEnabled,
} from "@/lib/platform/engines/payment/adapters/stripe/connect";
