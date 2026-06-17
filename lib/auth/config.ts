/** Comma-separated in NEXT_PUBLIC_ADMIN_EMAILS or server-only ADMIN_EMAILS. */
function parseAdminEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((email) => email.toLowerCase().trim())
    .filter(Boolean);
}

const ENV_ADMIN_EMAILS = parseAdminEmailList(
  process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS
);

if (ENV_ADMIN_EMAILS.length === 0 && process.env.NODE_ENV !== "production") {
  console.warn(
    "[auth] ADMIN_EMAILS / NEXT_PUBLIC_ADMIN_EMAILS unset — admin routes fail closed until configured."
  );
}

/** No hardcoded fallback — production must set env explicitly. */
export const ADMIN_EMAILS = ENV_ADMIN_EMAILS;

export function isAuthorizedAdminEmail(
  email: string | undefined | null
): boolean {
  if (!email || ADMIN_EMAILS.length === 0) return false;

  const normalized = email.toLowerCase().trim();

  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase().trim() === normalized
  );
}
