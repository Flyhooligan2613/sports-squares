import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/getAuthCallbackUrl";

export async function signInPlayerWithMagicLink(email: string) {
  const supabase = createClient();
  const emailRedirectTo = getAuthCallbackUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export async function signOutPlayer() {
  const supabase = createClient();
  await supabase.auth.signOut();
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
