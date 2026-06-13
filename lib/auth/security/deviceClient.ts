import { createHash, randomBytes } from "crypto";

export type DevicePlatform = "ios" | "android" | "windows" | "macos" | "web";

export interface DeviceInfo {
  deviceKey: string;
  deviceName: string;
  platform: DevicePlatform;
  userAgent: string;
}

const DEVICE_ID_KEY = "sb-device-id";
const REQUIRES_EMAIL_KEY = "sb-requires-email-signin";
const REMEMBER_ME_KEY = "sb-remember-me";
const STEP_UP_KEY = "sb-step-up-token";

export function getRequiresEmailSignIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REQUIRES_EMAIL_KEY) === "1";
}

export function setRequiresEmailSignIn(required: boolean): void {
  if (typeof window === "undefined") return;
  if (required) localStorage.setItem(REQUIRES_EMAIL_KEY, "1");
  else localStorage.removeItem(REQUIRES_EMAIL_KEY);
}

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") return true;
  const value = localStorage.getItem(REMEMBER_ME_KEY);
  if (value === null) return true;
  return value === "1";
}

export function setRememberMePreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_ME_KEY, enabled ? "1" : "0");
}

export function getOrCreateDeviceKey(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getStepUpToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STEP_UP_KEY);
}

export function setStepUpToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STEP_UP_KEY, token);
}

export function clearStepUpToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STEP_UP_KEY);
}

export function hashStepUpToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createStepUpToken(): string {
  return randomBytes(32).toString("hex");
}

export function detectDeviceInfo(userAgent: string, deviceKey: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  let platform: DevicePlatform = "web";
  let deviceName = "Web Browser";

  if (/iphone|ipad|ipod/.test(ua)) {
    platform = "ios";
    deviceName = /ipad/.test(ua) ? "iPad" : "iPhone";
  } else if (/android/.test(ua)) {
    platform = "android";
    deviceName = "Android Device";
  } else if (/windows/.test(ua)) {
    platform = "windows";
    deviceName = "Windows PC";
  } else if (/macintosh|mac os x/.test(ua)) {
    platform = "macos";
    deviceName = "Mac";
  }

  if (/edg\//.test(ua)) deviceName += " · Edge";
  else if (/chrome\//.test(ua) && !/edg\//.test(ua)) deviceName += " · Chrome";
  else if (/safari\//.test(ua) && !/chrome\//.test(ua)) deviceName += " · Safari";
  else if (/firefox\//.test(ua)) deviceName += " · Firefox";

  return {
    deviceKey,
    deviceName,
    platform,
    userAgent,
  };
}

export function biometricLabel(platform: DevicePlatform): string {
  switch (platform) {
    case "ios":
    case "macos":
      return "Face ID / Touch ID";
    case "android":
      return "Fingerprint";
    case "windows":
      return "Windows Hello";
    default:
      return "Biometric Login";
  }
}

export function isWebAuthnAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.PublicKeyCredential);
}
