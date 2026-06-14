const STORAGE_KEY = "sb-signup-device-v1";

export const OPEN_SIGNUP_EVENT = "sb-open-signup";
export const APP_SPLASH_COMPLETE_EVENT = "sb-splash-complete";

let signupOpenPending = false;

export interface DeviceSignupState {
  dismissed?: boolean;
  hasAuthenticated?: boolean;
}

function readAll(): Record<string, DeviceSignupState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DeviceSignupState>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, DeviceSignupState>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export function getDeviceSignupState(deviceKey: string): DeviceSignupState {
  return readAll()[deviceKey] ?? {};
}

export function markSignupDismissed(deviceKey: string): void {
  const all = readAll();
  all[deviceKey] = { ...all[deviceKey], dismissed: true };
  writeAll(all);
}

export function markDeviceHasAuthenticated(deviceKey: string): void {
  const all = readAll();
  all[deviceKey] = { ...all[deviceKey], hasAuthenticated: true, dismissed: false };
  writeAll(all);
}

export function shouldShowSignupPrompt(
  deviceKey: string,
  isAuthenticated: boolean
): boolean {
  if (isAuthenticated) return false;
  const state = getDeviceSignupState(deviceKey);
  if (state.hasAuthenticated) return false;
  if (state.dismissed) return false;
  return true;
}

export function notifySplashComplete(): void {
  if (typeof window === "undefined") return;
  (window as Window & { __sbSplashComplete?: boolean }).__sbSplashComplete = true;
  window.dispatchEvent(new CustomEvent(APP_SPLASH_COMPLETE_EVENT));
}

export function isSplashComplete(): boolean {
  if (typeof window === "undefined") return true;
  const flagged = (window as Window & { __sbSplashComplete?: boolean }).__sbSplashComplete;
  if (flagged) return true;
  return !document.documentElement.classList.contains("sb-splash-pending");
}

export function openSignupPrompt(): void {
  if (typeof window === "undefined") return;
  signupOpenPending = true;
  window.dispatchEvent(new CustomEvent(OPEN_SIGNUP_EVENT));
}

export function consumeSignupOpenPending(): boolean {
  const pending = signupOpenPending;
  signupOpenPending = false;
  return pending;
}

export function waitForSplashComplete(timeoutMs = 6000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (isSplashComplete()) {
      resolve();
      return;
    }

    const finish = () => {
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
      window.removeEventListener(APP_SPLASH_COMPLETE_EVENT, finish);
      resolve();
    };

    window.addEventListener(APP_SPLASH_COMPLETE_EVENT, finish, { once: true });

    const pollId = window.setInterval(() => {
      if (isSplashComplete()) finish();
    }, 120);

    const timeoutId = window.setTimeout(finish, timeoutMs);
  });
}
