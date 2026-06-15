/** Permanent — player completed push setup or browser permission is granted. */
const COMPLETE_KEY = "sb-push-prompt-complete";

/** Per browser tab session — prompt was shown or dismissed this visit. */
const SESSION_KEY = "sb-push-prompt-session";

/** Legacy key from earlier builds — cleared on read. */
const LEGACY_DISMISS_KEY = "sb-push-prompt-dismissed";

function clearLegacyDismissFlag(): void {
  try {
    localStorage.removeItem(LEGACY_DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

export function markPushPromptComplete(): void {
  clearLegacyDismissFlag();
  try {
    localStorage.setItem(COMPLETE_KEY, "1");
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function markPushPromptSeenThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isPushPromptSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Show the Game Day alerts prompt only when:
 * - push is supported
 * - permission is still "default" (not granted/denied)
 * - player has not completed setup on this device
 * - we have not already shown/dismissed it this browser session
 */
export function shouldShowPushPrompt(): boolean {
  if (!isPushPromptSupported()) return false;

  clearLegacyDismissFlag();

  if (Notification.permission === "granted") {
    markPushPromptComplete();
    return false;
  }

  if (Notification.permission === "denied") return false;

  try {
    if (localStorage.getItem(COMPLETE_KEY) === "1") return false;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
  } catch {
    return false;
  }

  return true;
}
