/** Map caught errors to player-facing copy — never expose API internals or stack traces. */

export type UserErrorContext =
  | "load"
  | "save"
  | "checkout"
  | "join"
  | "create"
  | "share"
  | "redeem"
  | "wallet"
  | "deposit"
  | "withdraw"
  | "generic";

const MESSAGES: Record<UserErrorContext, string> = {
  load: "We couldn't load this right now. Refresh the page or try again in a moment.",
  save: "Your changes couldn't be saved. Check your connection and try again.",
  checkout: "Checkout couldn't be completed. Verify your SquareWallet balance and try again.",
  join: "We couldn't add you to this contest. It may be full or closed — try another.",
  create: "We couldn't create this. Check your details and try again.",
  share: "Couldn't share to the Huddle. Try again in a moment.",
  redeem: "This code couldn't be redeemed. Check the code and try again.",
  wallet: "We couldn't load your SquareWallet right now. Refresh or try again shortly.",
  deposit: "Your deposit couldn't be started. Check your payment method and try again.",
  withdraw: "Your withdrawal couldn't be processed. Check your balance and cash-out account.",
  generic: "Something went wrong. Please try again.",
};

const TECHNICAL_MARKERS = [
  "fetch failed",
  "failed to fetch",
  "network error",
  "networkrequestfailed",
  "econnrefused",
  "timeout",
  "timed out",
  "supabase",
  "postgres",
  "pgrst",
  "jwt",
  " sql",
  "relation ",
  "column ",
  "duplicate key",
  "violates",
  "constraint",
  "internal server",
  "unexpected token",
  "syntax error",
  "at object.",
  "at async",
  "stack trace",
  "unauthorized",
  "forbidden",
  "invalid json",
  "next.js",
  "hydration",
  "typeerror",
  "referenceerror",
];

function isTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase();
  if (message.length > 140) return true;
  return TECHNICAL_MARKERS.some((marker) => lower.includes(marker));
}

function mapKnownMessage(message: string, context: UserErrorContext): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Wait a minute and try again.";
  }

  if (lower.includes("not found") || lower.includes("404")) {
    return context === "load"
      ? "This contest or page wasn't found. It may have ended or moved."
      : MESSAGES[context];
  }

  if (lower.includes("already joined") || lower.includes("already entered")) {
    return "You're already in this contest. Open My Games to track your entry.";
  }

  if (
    lower.includes("contest full") ||
    lower.includes("board full") ||
    lower.includes("sold out")
  ) {
    return "This contest is full. Browse other contests or check back soon.";
  }

  if (lower.includes("closed") || lower.includes("entries locked")) {
    return "Entries are closed for this contest.";
  }

  if (lower.includes("insufficient") || lower.includes("not enough")) {
    return context === "withdraw"
      ? "Insufficient withdrawable balance for this amount."
      : "Insufficient SquareWallet balance. Add funds and try again.";
  }

  if (lower.includes("stripe") || lower.includes("payment_intent") || lower.includes("card_declined")) {
    return context === "deposit"
      ? "Your card couldn't be charged. Try a different payment method."
      : MESSAGES[context];
  }

  if (lower.includes("suspended")) {
    return "This account is temporarily suspended. Contact support@squareboards.pro.";
  }

  if (
    lower.includes("sign in") ||
    lower.includes("log in") ||
    lower.includes("session expired") ||
    lower.includes("not authenticated")
  ) {
    return "Your session expired. Sign in again to continue.";
  }

  if (lower.includes("payment") && (lower.includes("method") || lower.includes("card"))) {
    return "Add a payment method in SquareWallet before checking out.";
  }

  return null;
}

export function formatUserError(err: unknown, context: UserErrorContext = "generic"): string {
  const fallback = MESSAGES[context];

  const message =
    typeof err === "string"
      ? err.trim()
      : err instanceof Error
        ? err.message.trim()
        : "";

  if (!message) {
    return fallback;
  }

  const mapped = mapKnownMessage(message, context);
  if (mapped) return mapped;

  if (!isTechnicalMessage(message) && message.length <= 120) {
    return message;
  }

  return fallback;
}
