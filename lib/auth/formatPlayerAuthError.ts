const TECHNICAL_AUTH_MARKERS = [
  "authentication failed",
  "auth session missing",
  "jwt",
  "supabase",
  "pgrst",
  "internal server",
  "unexpected token",
  "econnrefused",
  "fetch failed",
  "network error",
];

function isTechnicalAuthMessage(message: string): boolean {
  const lower = message.toLowerCase();
  if (message.length > 120) return true;
  return TECHNICAL_AUTH_MARKERS.some((marker) => lower.includes(marker));
}

/** Map Supabase auth errors to player-friendly copy. */
export function formatPlayerAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many sign-in emails sent recently. Wait about an hour, then try again — or check your inbox for a link from an earlier attempt.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Sign-in is temporarily unavailable. Please try again later.";
  }

  if (
    lower.includes("error sending magic link") ||
    lower.includes("email delivery is not configured")
  ) {
    return "We couldn't send your sign-in email. Try again in a few minutes, or open the access link on your purchase confirmation page.";
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials") ||
    lower.includes("authentication failed")
  ) {
    return "Wrong password — or no password set yet. Sign in with your email link, then set a password under Security.";
  }

  if (lower.includes("already exists") || lower.includes("already registered")) {
    return "An account with this email already exists. Sign in instead, or use Forgot password.";
  }

  if (lower.includes("session expired") || lower.includes("not authenticated")) {
    return "Your session expired. Sign in again to continue.";
  }

  if (lower.includes("sign-up failed") || lower.includes("signup failed")) {
    return "We couldn't create your account. Check your details and try again.";
  }

  if (lower.includes("sign-in failed") || lower.includes("signin failed")) {
    return "We couldn't sign you in. Check your email and password, then try again.";
  }

  if (isTechnicalAuthMessage(message)) {
    return "Something went wrong. Please try again in a moment.";
  }

  return message;
}

/** Map WebAuthn / step-up errors to player-friendly copy. */
export function formatStepUpError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("abort") || lower.includes("cancel") || lower.includes("not allowed")) {
    return "Verification was cancelled. Try again when you're ready.";
  }

  if (lower.includes("not supported") || lower.includes("not available")) {
    return "Biometric verification isn't available on this device. Use your Quick PIN or password instead.";
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Verification timed out. Please try again.";
  }

  if (lower.includes("incorrect") || lower.includes("invalid pin") || lower.includes("wrong pin")) {
    return "Incorrect PIN. Try again.";
  }

  if (lower.includes("not registered") || lower.includes("no credentials")) {
    return "No biometric sign-in set up yet. Use your email link or set up biometrics under Security.";
  }

  return "We couldn't verify your identity. Try again or use a different sign-in method.";
}
