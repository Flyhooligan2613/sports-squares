import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

function tokenFromActionLink(actionLink: string | null | undefined): string | null {
  if (!actionLink) return null;
  try {
    return new URL(actionLink).searchParams.get("token");
  } catch {
    return null;
  }
}

/** Mint a Supabase session for a verified player without sending email. */
export async function createPlayerSessionForEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: normalized,
  });

  if (error) {
    console.error("[createPlayerSessionForEmail]", error.message);
    return false;
  }

  const token =
    tokenFromActionLink(data.properties?.action_link) ??
    data.properties?.hashed_token ??
    null;

  if (!token) return false;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  for (const type of ["magiclink", "email"] as const) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type,
    });
    if (!verifyError) return true;
  }

  return false;
}
