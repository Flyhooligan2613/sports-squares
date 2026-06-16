/** Provider-agnostic payment types — no Stripe or merchant specifics. */

export type PaymentProviderId =
  | "stripe"
  | "future_gaming"
  | "future_fantasy_sports"
  | "future_ach"
  | "future_bank_transfer"
  | "future_apple_pay"
  | "future_google_pay"
  | "future_crypto";

export type PaymentTransactionStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentTransactionType =
  | "deposit"
  | "withdrawal"
  | "contest_entry"
  | "prize_payout"
  | "refund"
  | "reward_credit"
  | "wallet_transfer"
  | "authorization";

export type WalletBalanceType = "available" | "pending";

export type PaymentMethodType = "card" | "bank_account" | "wallet" | "unknown";

/** Standardized provider response — adapters map native objects here. */
export interface PaymentProviderResult<T = Record<string, unknown>> {
  ok: boolean;
  provider: PaymentProviderId;
  providerTransactionId: string | null;
  status: PaymentTransactionStatus;
  amountCents: number;
  currency: string;
  feesCents?: number;
  metadata?: Record<string, string>;
  raw?: T;
  error?: PaymentProviderErrorPayload;
}

export interface PaymentProviderErrorPayload {
  code: string;
  message: string;
  retryable?: boolean;
  userMessage?: string;
}

export interface CreateCustomerInput {
  email: string;
  displayName?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerResult extends PaymentProviderResult {
  customerId: string;
}

export interface DepositInput {
  email: string;
  amountCents: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  lineItems?: Array<{
    name: string;
    description?: string;
    unitAmountCents: number;
    quantity: number;
  }>;
  setupFutureUsage?: boolean;
}

export interface DepositResult extends PaymentProviderResult {
  checkoutUrl?: string;
  sessionId?: string;
}

export interface ChargeSavedMethodInput {
  email: string;
  amountCents: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface WithdrawInput {
  email: string;
  amountCents: number;
  currency?: string;
  metadata?: Record<string, string>;
  idempotencyKey: string;
}

export interface AuthorizeInput {
  email: string;
  amountCents: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface CaptureInput {
  providerTransactionId: string;
  amountCents?: number;
}

export interface RefundInput {
  providerTransactionId: string;
  amountCents?: number;
  reason?: string;
}

export interface CreatePayoutInput {
  email: string;
  amountCents: number;
  destinationAccountId: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface VerifyIdentityInput {
  email: string;
  displayName?: string;
  returnUrl?: string;
  refreshUrl?: string;
  prefill?: Record<string, string>;
}

export interface VerifyIdentityResult extends PaymentProviderResult {
  onboardingUrl?: string;
  accountId?: string;
  detailsSubmitted?: boolean;
  payoutsEnabled?: boolean;
}

export interface VerifyBankInput {
  email: string;
  returnUrl?: string;
}

export interface SavePaymentMethodInput {
  email: string;
  customerId: string;
  paymentMethodId: string;
}

export interface DeletePaymentMethodInput {
  email: string;
  paymentMethodId: string;
}

export interface ProcessWebhookInput {
  body: string;
  signature: string | null;
  headers?: Record<string, string>;
}

export interface ProcessWebhookResult {
  handled: boolean;
  eventType?: string;
  eventId?: string;
  duplicate?: boolean;
}

export interface GetTransactionInput {
  providerTransactionId: string;
}

export interface CancelTransactionInput {
  providerTransactionId: string;
}

/** SquareWallet™ balance categories — ledger-backed where tables exist. */
export interface SquareWalletBalanceBreakdown {
  availableBalanceCents: number;
  pendingBalanceCents: number;
  contestEntriesCents: number;
  contestWinningsCents: number;
  depositsCents: number;
  withdrawalsCents: number;
  rewardCreditsCents: number;
  marketplaceCreditsCents: number;
  promotionalCreditsCents: number;
  refundsCents: number;
  /** Phase 2 — not yet implemented. */
  giftCardBalanceCents: number | null;
  teamWalletBalanceCents: number | null;
  familyWalletBalanceCents: number | null;
  subscriptionCreditsCents: number | null;
}

/** SquareWallet™ — platform-owned wallet view (no raw PAN/bank numbers). */
export interface SquareWalletSummary {
  email: string;
  providerCustomerId: string | null;
  defaultPaymentMethodId: string | null;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  fastCheckoutAvailable: boolean;
  accountSuspended: boolean;
  availableBalanceCents: number;
  pendingBalanceCents: number;
  balances: SquareWalletBalanceBreakdown;
}

export interface SquareWalletTransaction {
  id: string;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  amountCents: number;
  feesCents: number;
  currency: string;
  description: string | null;
  contestId: string | null;
  poolId: string | null;
  provider: PaymentProviderId;
  createdAt: string;
}

/** Transaction Center row shape. */
export interface PaymentTransactionRecord {
  id: string;
  playerEmail: string;
  playerId: string | null;
  contestId: string | null;
  poolId: string | null;
  provider: PaymentProviderId;
  providerTransactionId: string | null;
  walletType: WalletBalanceType | null;
  paymentMethodType: PaymentMethodType | null;
  paymentMethodLast4: string | null;
  transactionType: PaymentTransactionType;
  amountCents: number;
  feesCents: number;
  currency: string;
  status: PaymentTransactionStatus;
  idempotencyKey: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  auditLog: PaymentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAuditEntry {
  at: string;
  action: string;
  detail?: string;
}

/** PaymentProvider — adapters implement transport only; no contest business logic. */
export interface PaymentProvider {
  readonly id: PaymentProviderId;

  isConfigured(): boolean;

  createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult>;

  deposit(input: DepositInput): Promise<DepositResult>;

  withdraw(input: WithdrawInput): Promise<PaymentProviderResult>;

  authorize(input: AuthorizeInput): Promise<PaymentProviderResult>;

  capture(input: CaptureInput): Promise<PaymentProviderResult>;

  refund(input: RefundInput): Promise<PaymentProviderResult>;

  createPayout(input: CreatePayoutInput): Promise<PaymentProviderResult>;

  verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult>;

  verifyBank(input: VerifyBankInput): Promise<PaymentProviderResult>;

  savePaymentMethod(input: SavePaymentMethodInput): Promise<PaymentProviderResult>;

  deletePaymentMethod(input: DeletePaymentMethodInput): Promise<PaymentProviderResult>;

  processWebhook(input: ProcessWebhookInput): Promise<ProcessWebhookResult>;

  getTransaction(input: GetTransactionInput): Promise<PaymentProviderResult>;

  cancelTransaction(input: CancelTransactionInput): Promise<PaymentProviderResult>;

  /** Provider-specific: charge a saved payment method (fast checkout). */
  chargeSavedMethod?(input: ChargeSavedMethodInput): Promise<PaymentProviderResult>;

  /** Provider-specific: sync wallet after hosted checkout. */
  syncWalletFromCheckout?(sessionId: string): Promise<void>;

  /** Provider-specific: retrieve checkout session for status polling. */
  retrieveCheckoutSession?(sessionId: string): Promise<{
    paid: boolean;
    metadata: Record<string, string>;
    amountCents: number;
    paymentIntentId: string | null;
  } | null>;

  /** Provider-specific: connect/payout feature flags. */
  isConnectEnabled?(): boolean;

  isConnectV2PayoutsEnabled?(): boolean;
}
