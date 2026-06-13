import type { SecurityEventType } from "@/lib/auth/security/db";

export function resolveLoginLocation(headers: Headers): string | null {
  const city = headers.get("x-vercel-ip-city");
  const region = headers.get("x-vercel-ip-country-region");
  const country = headers.get("x-vercel-ip-country");
  const parts = [city, region, country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function resolveClientIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export function parseBrowserName(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  return "Browser";
}

export function securityEventLabel(type: SecurityEventType): string {
  switch (type) {
    case "biometric_login":
      return "Face ID / Fingerprint login";
    case "pin_login":
      return "Quick PIN unlock";
    case "pin_enabled":
      return "Quick PIN enabled";
    case "pin_locked":
      return "Quick PIN locked";
    case "new_device_login":
      return "New device added";
    case "device_acknowledged":
      return "Device confirmed";
    case "account_secured":
      return "Account secured";
    case "purchase_confirmed":
      return "Purchase confirmed";
    case "payout_change":
      return "Payout settings updated";
    case "biometric_enabled":
      return "Biometrics enabled";
    case "sign_out_all":
      return "Signed out everywhere";
    case "device_revoked":
      return "Device removed";
    case "email_change":
      return "Email changed";
    case "phone_change":
      return "Phone updated";
    case "profile_update":
      return "Profile updated";
    case "session_revoked":
      return "Session revoked";
    case "unusual_login":
      return "Unusual login detected";
    case "password_change":
      return "Password changed";
  }
}

export function computeSecurityScore(input: {
  emailVerified: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  trustedDeviceCount: number;
}): number {
  let score = 40;
  if (input.emailVerified) score += 20;
  if (input.biometricEnabled) score += 20;
  if (input.pinEnabled) score += 10;
  if (input.trustedDeviceCount > 0) score += 10;
  return Math.min(100, score);
}
