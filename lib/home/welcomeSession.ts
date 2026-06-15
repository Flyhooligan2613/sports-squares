export const WELCOME_HOME_KEY = "sb-welcome-home";

export function markWelcomeHomePending(): void {
  try {
    sessionStorage.setItem(WELCOME_HOME_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeWelcomeHomePending(): boolean {
  try {
    if (sessionStorage.getItem(WELCOME_HOME_KEY) === "1") {
      sessionStorage.removeItem(WELCOME_HOME_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function peekWelcomeHomePending(): boolean {
  try {
    return sessionStorage.getItem(WELCOME_HOME_KEY) === "1";
  } catch {
    return false;
  }
}

export function resolveWelcomeHomeFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("welcome") !== "1") return false;

  markWelcomeHomePending();
  params.delete("welcome");
  const next = params.toString();
  const path = window.location.pathname;
  window.history.replaceState({}, "", next ? `${path}?${next}` : path);
  return true;
}
