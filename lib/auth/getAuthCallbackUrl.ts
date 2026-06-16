import { getAppUrl } from "@/lib/platform/engines/payment";

/** Redirect target for Supabase magic links and OAuth callbacks. */
export function getAuthCallbackUrl(): string {
  const next = "/my-games";

  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
