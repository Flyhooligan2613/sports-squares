/** SquareWallet™ player-facing copy — Phase 3B financial trust polish. */

export const WALLET_COPY = {
  depositSuccess: "Your funds have been added successfully.",
  depositSuccessBody:
    "Your SquareWallet™ is funded — you're ready to join your next contest.",
  emptyTransactions:
    "Your transaction history will appear here after your first deposit or withdrawal.",
  zeroBalance: "Add funds securely to join your first contest.",
  trust: {
    encrypted: "Encrypted Transactions",
    securePayments: "Secure Payments",
    trustedPartners: "Powered by Trusted Payment Partners",
  },
  withdrawal: {
    estimatedArrival: "Typically arrives in 1–3 business days.",
    requested: "Requested",
    processing: "Processing",
    completed: "Completed",
    underReview: "Under Review",
    holdRapidDeposit:
      "Your withdrawal is under a brief security review after a recent deposit. We'll notify you when it's sent.",
    holdLargeWithdrawal:
      "Large withdrawals receive an extra verification step for your protection. We'll notify you when it's sent.",
    holdKyc: "Identity verification is required before this withdrawal can be sent.",
    verificationRequired: "Verify with biometrics or Quick PIN before cashing out.",
  },
  receipt: {
    title: "Transaction Receipt",
    reference: "Reference Number",
    timestamp: "Date & Time",
    amount: "Amount",
    fee: "Fee",
    status: "Status",
    description: "Description",
    paymentMethod: "Payment Method",
    support: "Need help?",
    supportLink: "Contact Support",
  },
} as const;

export type WalletTransactionStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed"
  | "refunded"
  | "cancelled";

export const WALLET_STATUS_LABELS: Record<WalletTransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};
