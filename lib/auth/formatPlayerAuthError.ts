/** Map Supabase auth errors to player-friendly copy. */
export function formatPlayerAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many sign-in emails sent recently. Wait about an hour, then try again — or check your inbox for a link from an earlier attempt.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Sign-in is temporarily unavailable. Please try again later.";
  }

  return message;
}
