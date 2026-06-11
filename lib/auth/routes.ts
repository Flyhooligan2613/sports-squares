export const ADMIN_LOGIN = "/admin/login";

/** Routes that require an authenticated, whitelisted admin session. */
export function requiresAdminSession(pathname: string): boolean {
  if (pathname === "/create") return true;
  if (!pathname.startsWith("/admin")) return false;
  if (pathname === ADMIN_LOGIN) return false;
  return true;
}
