/**
 * SquareBoards admin philosophy — monitoring only, never financial override.
 */

export const ADMIN_CAPABILITIES = [
  "View players",
  "View boards",
  "View Pick'em contests",
  "View game schedules",
  "View analytics",
  "View support tickets",
  "Suspend abusive accounts",
  "Send platform announcements",
  "Monitor automation status",
  "Review audit logs",
  "Monitor payout status (read-only)",
  "Monitor Stripe webhook health",
] as const;

export const ADMIN_RESTRICTIONS = [
  "Edit scores",
  "Change winners",
  "Modify purchased squares",
  "Change Pick'em selections",
  "Issue payouts manually",
  "Refund purchases manually",
  "Transfer money",
  "Access Stripe balances",
  "Override winner calculations",
  "Modify completed games",
] as const;

export const ADMIN_PHILOSOPHY =
  "SquareBoards has one platform administrator for health monitoring and technical support. All game outcomes and financial flows are fully automated.";

export const STRIPE_FINANCIAL_AUTHORITY =
  "Stripe is the financial authority for payments, refunds, payouts, transfers, and connected accounts. Administrators monitor status only.";
