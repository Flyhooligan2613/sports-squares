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

  return message;
}
