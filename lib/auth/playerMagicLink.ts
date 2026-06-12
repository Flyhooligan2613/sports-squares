import { sendPlayerSignInEmail } from "@/lib/email/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/stripe/config";
import { TABLES } from "@/lib/database/config";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildPlayerSignInUrl(email: string, token: string): string {
  const params = new URLSearchParams({
    token,
    email: normalizeEmail(email),
    next: "/my-games",
  });
  return `${getAppUrl()}/auth/verify?${params.toString()}`;
}

function tokenFromActionLink(actionLink: string | null | undefined): string | null {
  if (!actionLink) return null;
  try {
    return new URL(actionLink).searchParams.get("token");
  } catch {
    return null;
  }
}

/** One-time magic link for immediate post-purchase access. */
export async function createPlayerMagicLink(
  email: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent("/my-games")}`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: normalizeEmail(email),
    options: { redirectTo },
  });

  if (error) {
    console.error("[createPlayerMagicLink]", error.message);
    return null;
  }

  const token =
    tokenFromActionLink(data.properties?.action_link) ??
    data.properties?.hashed_token ??
    null;

  if (!token) {
    console.error("[createPlayerMagicLink] missing token in generateLink response");
    return null;
  }

  return buildPlayerSignInUrl(email, token);
}

export async function playerEmailHasPurchases(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { count, error } = await supabase
    .from(TABLES.players)
    .select("id", { count: "exact", head: true })
    .ilike("email", normalized);

  if (error) {
    console.error("[playerEmailHasPurchases]", error.message);
    return false;
  }

  return (count ?? 0) > 0;
}

/** Send sign-in link via Resend (bypasses Supabase built-in email). */
export async function sendPlayerMagicLinkEmail(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const signInUrl = await createPlayerMagicLink(email);
  if (!signInUrl) {
    return { ok: false, error: "Could not create sign-in link." };
  }

  const emailResult = await sendPlayerSignInEmail({
    to: email,
    signInUrl,
  });

  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  return { ok: true };
}
