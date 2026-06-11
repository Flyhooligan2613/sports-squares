export { createClient } from "./supabase/client";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  return {
    url,
    publishableKey,
    isConfigured: Boolean(url && publishableKey),
  };
}

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  const { url, publishableKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      ok: false,
      message:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    };
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
    });

    if (response.ok) {
      return { ok: true, message: "Connected Successfully" };
    }

    const body = await response.text();
    return {
      ok: false,
      message: `HTTP ${response.status}: ${body || response.statusText}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
