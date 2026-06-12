import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/stripe/config";

/** One-time magic link for immediate post-purchase access. */
export async function createPlayerMagicLink(
  email: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent("/my-games")}`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim().toLowerCase(),
    options: { redirectTo },
  });

  if (error) {
    console.error("[createPlayerMagicLink]", error.message);
    return null;
  }

  return data.properties?.action_link ?? null;
}

export async function sendPlayerMagicLinkEmail(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ok: false, error: "Auth is not configured." };
  }

  const redirectTo = `${getAppUrl()}/auth/callback?next=/my-games`;
  const response = await fetch(`${url}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      msg?: string;
      error_description?: string;
    };
    return {
      ok: false,
      error: body.msg ?? body.error_description ?? "Could not send magic link.",
    };
  }

  return { ok: true };
}
