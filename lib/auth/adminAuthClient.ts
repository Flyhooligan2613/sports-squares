import { createClient } from "@/lib/supabase/client";
import { isAuthorizedAdminEmail } from "./config";

export async function signInAdmin(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  if (!isAuthorizedAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "Unauthorized account" };
  }

  return { ok: true as const, user: data.user };
}

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getClientSessionUser() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) return null;
  return session.user;
}

export async function verifyClientAdminSession() {
  try {
    const user = await getClientSessionUser();
    if (!user) {
      return { authorized: false as const, reason: "no-session" as const };
    }
    if (!isAuthorizedAdminEmail(user.email)) {
      await signOutAdmin();
      return { authorized: false as const, reason: "unauthorized" as const };
    }
    return { authorized: true as const, user };
  } catch {
    return { authorized: false as const, reason: "no-session" as const };
  }
}
