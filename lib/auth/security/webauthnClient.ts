"use client";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import {
  getOrCreateDeviceKey,
  getRememberMePreference,
  setRequiresEmailSignIn,
} from "@/lib/auth/security/deviceClient";

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status}).`);
  }
  return data;
}

export async function registerDeviceAfterLogin(rememberMe?: boolean) {
  const deviceKey = getOrCreateDeviceKey();
  await postJson("/api/auth/device/register", {
    deviceKey,
    rememberMe: rememberMe ?? getRememberMePreference(),
  });
  setRequiresEmailSignIn(false);
}

export async function registerBiometricLogin(deviceName: string) {
  const deviceKey = getOrCreateDeviceKey();
  const { options } = await postJson<{ options: PublicKeyCredentialCreationOptionsJSON }>(
    "/api/auth/webauthn/register/options",
    { deviceKey, deviceName }
  );
  const response = (await startRegistration({ optionsJSON: options })) as RegistrationResponseJSON;
  await postJson("/api/auth/webauthn/register/verify", { deviceKey, response });
}

export async function signInWithBiometric(email: string, rememberMe?: boolean) {
  const deviceKey = getOrCreateDeviceKey();
  const { options } = await postJson<{ options: PublicKeyCredentialRequestOptionsJSON }>(
    "/api/auth/webauthn/authenticate/options",
    { email, deviceKey }
  );
  const response = (await startAuthentication({ optionsJSON: options })) as AuthenticationResponseJSON;
  await postJson("/api/auth/webauthn/authenticate/verify", {
    email,
    deviceKey,
    response,
    rememberMe: rememberMe ?? getRememberMePreference(),
  });
  setRequiresEmailSignIn(false);
}

export async function confirmSensitiveActionWithBiometric(
  purpose: "payout_change" | "email_change" | "account_delete" | "view_financials"
) {
  const deviceKey = getOrCreateDeviceKey();
  const { options } = await postJson<{ options: PublicKeyCredentialRequestOptionsJSON }>(
    "/api/auth/webauthn/authenticate/options",
    { email: await getCurrentEmail(), deviceKey }
  );
  const response = (await startAuthentication({ optionsJSON: options })) as AuthenticationResponseJSON;
  const result = await postJson<{ stepUpToken: string }>("/api/auth/step-up/biometric", {
    deviceKey,
    response,
    purpose,
  });
  return result.stepUpToken;
}

async function getCurrentEmail(): Promise<string> {
  const deviceKey = getOrCreateDeviceKey();
  const res = await fetch(`/api/auth/bootstrap?deviceKey=${encodeURIComponent(deviceKey)}`, {
    cache: "no-store",
    credentials: "include",
  });
  const data = (await res.json()) as { email?: string | null; authenticated?: boolean };
  if (!data.authenticated || !data.email) {
    throw new Error("Sign in required.");
  }
  return data.email;
}

export async function fetchAuthBootstrap(email?: string) {
  const deviceKey = getOrCreateDeviceKey();
  const params = new URLSearchParams({ deviceKey });
  if (email) params.set("email", email);
  const res = await fetch(`/api/auth/bootstrap?${params}`, {
    cache: "no-store",
    credentials: "include",
  });
  return (await res.json()) as {
    authenticated: boolean;
    email?: string | null;
    passkeyAvailable?: boolean;
    webAuthnSupported?: boolean;
    trustedDevice?: boolean;
    emailVerified?: boolean;
    rememberMe?: boolean;
  };
}
