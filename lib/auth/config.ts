export const ADMIN_EMAILS = ["ithomaspk@gmail.com"];

export function isAuthorizedAdminEmail(
  email: string | undefined | null
): boolean {
  if (!email) return false;

  const normalized = email.toLowerCase().trim();

  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase().trim() === normalized
  );
}
