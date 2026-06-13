import { createClient } from "@/lib/supabase/client";
import { clearStepUpToken } from "@/lib/auth/security/deviceClient";

export async function signInPlayerWithMagicLink(
  email: string,
  options?: { rememberMe?: boolean; deviceKey?: string }
) {
  const response = await fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      rememberMe: options?.rememberMe ?? true,
      deviceKey: options?.deviceKey,
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

export async function signOutPlayer() {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearStepUpToken();
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
