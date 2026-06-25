import { createClient } from "@/lib/supabase/client";
import { clearAppUnlock, clearStepUpToken } from "@/lib/auth/security/deviceClient";

export async function signInPlayerWithMagicLink(
  emailOrIdentifier: string,
  options?: { rememberMe?: boolean; deviceKey?: string; referralCode?: string }
) {
  const response = await fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailOrIdentifier.includes("@") ? emailOrIdentifier.trim().toLowerCase() : undefined,
      identifier: emailOrIdentifier.includes("@") ? undefined : emailOrIdentifier.trim(),
      rememberMe: options?.rememberMe ?? true,
      deviceKey: options?.deviceKey,
      referralCode: options?.referralCode,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.error ?? "Could not send sign-in link.",
    };
  }

  return { ok: true as const };
}

export async function signInPlayerWithPassword(
  emailOrIdentifier: string,
  password: string,
  options?: { rememberMe?: boolean; deviceKey?: string; referralCode?: string }
) {
  const response = await fetch("/api/auth/password-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: emailOrIdentifier.includes("@") ? emailOrIdentifier.trim().toLowerCase() : undefined,
      identifier: emailOrIdentifier.includes("@") ? undefined : emailOrIdentifier.trim(),
      password,
      rememberMe: options?.rememberMe ?? true,
      deviceKey: options?.deviceKey,
      referralCode: options?.referralCode,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.error ?? "Could not sign in.",
    };
  }

  return { ok: true as const };
}

export async function requestPasswordReset(emailOrIdentifier: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailOrIdentifier.includes("@") ? emailOrIdentifier.trim().toLowerCase() : undefined,
      identifier: emailOrIdentifier.includes("@") ? undefined : emailOrIdentifier.trim(),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.error ?? "Could not send reset link.",
    };
  }

  return { ok: true as const };
}

export async function signOutPlayer() {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearStepUpToken();
  clearAppUnlock();
}

export interface SignUpPlayerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  avatarEmoji?: string;
  deviceKey?: string;
  rememberMe?: boolean;
  referralCode?: string;
}

export async function signUpPlayer(input: SignUpPlayerInput) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    slug?: string;
  };

  if (!response.ok) {
    return {
      ok: false as const,
      error: payload.error ?? "Could not create account.",
    };
  }

  return { ok: true as const, slug: payload.slug };
}

export async function getPlayerSessionUser() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) return null;
  return session.user;
}
