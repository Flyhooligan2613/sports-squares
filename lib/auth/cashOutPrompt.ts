export const CASHOUT_PROMPT_PENDING_KEY = "sb-cashout-prompt-pending";
export const OPEN_CASHOUT_SETUP_EVENT = "sb-open-cashout-setup";

function dismissedKey(email: string): string {
  return `sb-cashout-dismissed:${email.trim().toLowerCase()}`;
}

export function markCashOutPromptPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CASHOUT_PROMPT_PENDING_KEY, "1");
}

export function peekCashOutPromptPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CASHOUT_PROMPT_PENDING_KEY) === "1";
}

export function consumeCashOutPromptPending(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(CASHOUT_PROMPT_PENDING_KEY) === "1";
  sessionStorage.removeItem(CASHOUT_PROMPT_PENDING_KEY);
  return pending;
}

export function markCashOutPromptDismissed(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(dismissedKey(email), "1");
}

export function wasCashOutPromptDismissed(email: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(dismissedKey(email)) === "1";
}

export function clearCashOutPromptDismissed(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(dismissedKey(email));
}

export function openCashOutSetupPrompt(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CASHOUT_SETUP_EVENT));
}

export const CASHOUT_SETUP_PATH = "/my-games/winnings?setup=cashout";

export function cashOutSetupUrl(autostart = false): string {
  return autostart ? `${CASHOUT_SETUP_PATH}&autostart=1` : CASHOUT_SETUP_PATH;
}
