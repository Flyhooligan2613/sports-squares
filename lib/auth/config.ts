/** Comma-separated in NEXT_PUBLIC_ADMIN_EMAILS (e.g. you@domain.com,other@domain.com) */
function parseAdminEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
   .split(",")
    .map((email) => email.toLowerCase().trim())
    .filter(Boolean);
}

const ENV_ADMIN_EMAILS = parseAdminEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS);

/** Fallback when env is unset (local dev). Prefer NEXT_PUBLIC_ADMIN_EMAILS in production. */
const DEFAULT_ADMIN_EMAILS = ["ithomaspk@gmail.com"];

export const ADMIN_EMAILS =
  ENV_ADMIN_EMAILS.length > 0 ? ENV_ADMIN_EMAILS : DEFAULT_ADMIN_EMAILS;

export function isAuthorizedAdminEmail(
  email: string | undefined | null
): boolean {
  if (!email) return false;

  const normalized = email.toLowerCase().trim();

  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase().trim() === normalized
  );
}
