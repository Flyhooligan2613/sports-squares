const PENDING_KEY = "sb-first-login-welcome-pending";
const SEEN_PREFIX = "sb-first-login-welcome-seen:";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function markFirstLoginWelcomePending(): void {
  try {
    sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeFirstLoginWelcomePending(): boolean {
  try {
    if (sessionStorage.getItem(PENDING_KEY) === "1") {
      sessionStorage.removeItem(PENDING_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function hasSeenFirstLoginWelcome(email: string): boolean {
  try {
    return localStorage.getItem(`${SEEN_PREFIX}${normalizeEmail(email)}`) === "1";
  } catch {
    return false;
  }
}

export function markFirstLoginWelcomeSeen(email: string): void {
  try {
    localStorage.setItem(`${SEEN_PREFIX}${normalizeEmail(email)}`, "1");
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}
