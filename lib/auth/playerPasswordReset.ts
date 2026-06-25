import { sendPlayerPasswordResetEmail } from "@/lib/email/resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/platform/engines/payment";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildPlayerPasswordResetUrl(tokenHash: string): string {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type: "recovery",
    next: "/my-games/reset-password",
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

export async function createPlayerPasswordResetLink(
  email: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent("/my-games/reset-password")}`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizeEmail(email),
    options: { redirectTo },
  });

  if (error) {
    console.error("[createPlayerPasswordResetLink]", error.message);
    return null;
  }

  const token =
    tokenFromActionLink(data.properties?.action_link) ??
    data.properties?.hashed_token ??
    null;

  if (!token) {
    console.error("[createPlayerPasswordResetLink] missing token in generateLink response");
    return null;
  }

  return buildPlayerPasswordResetUrl(token);
}

/** Send password reset link via Resend (bypasses Supabase built-in email). */
export async function sendPlayerPasswordResetEmailFlow(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const resetUrl = await createPlayerPasswordResetLink(email);
  if (!resetUrl) {
    return { ok: false, error: "Could not create password reset link." };
  }

  const emailResult = await sendPlayerPasswordResetEmail({
    to: email,
    resetUrl,
  });

  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  return { ok: true };
}
