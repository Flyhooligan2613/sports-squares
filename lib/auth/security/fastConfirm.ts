"use client";

import {
  getOrCreateDeviceKey,
  hasRecentLocalUnlock,
  isWebAuthnAvailable,
  markLocalUnlock,
  setStepUpToken,
} from "@/lib/auth/security/deviceClient";
import { isQuickPinEnabledLocally, verifyQuickPin } from "@/lib/auth/security/quickPin";
import { confirmSensitiveActionWithBiometric } from "@/lib/auth/security/webauthnClient";
import type { StepUpPurpose } from "@/lib/auth/security/stepUp";

async function issueTrustedStepUp(purpose: StepUpPurpose): Promise<string> {
  const deviceKey = getOrCreateDeviceKey();
  const res = await fetch("/api/auth/step-up/trusted", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ deviceKey, purpose }),
  });
  const data = (await res.json()) as { stepUpToken?: string; error?: string };
  if (!res.ok || !data.stepUpToken) {
    throw new Error(data.error ?? "Could not confirm action.");
  }
  return data.stepUpToken;
}

export async function confirmFastAction(
  purpose: StepUpPurpose,
  email: string,
  pin?: string
): Promise<string> {
  if (hasRecentLocalUnlock()) {
    const token = await issueTrustedStepUp(purpose);
    setStepUpToken(token);
    return token;
  }

  if (isWebAuthnAvailable()) {
    try {
      const token = await confirmSensitiveActionWithBiometric(purpose);
      markLocalUnlock();
      setStepUpToken(token);
      return token;
    } catch {
      // fall through to PIN
    }
  }

  if (pin && isQuickPinEnabledLocally(email)) {
    const ok = await verifyQuickPin(email, pin);
    if (!ok) throw new Error("Incorrect PIN.");
    markLocalUnlock();
    const token = await issueTrustedStepUp(purpose);
    setStepUpToken(token);
    return token;
  }

  throw new Error("Confirm with biometrics or Quick PIN to continue.");
}

export async function confirmPurchase(email: string, pin?: string): Promise<string> {
  return confirmFastAction("purchase", email, pin);
}

export async function ensurePayoutStepUp(email?: string, pin?: string): Promise<string | null> {
  try {
    if (!email) {
      const res = await fetch(`/api/auth/bootstrap?deviceKey=${encodeURIComponent(getOrCreateDeviceKey())}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as { email?: string };
      email = data.email;
    }
    if (!email) return null;
    return await confirmFastAction("payout_change", email, pin);
  } catch {
    return null;
  }
}
