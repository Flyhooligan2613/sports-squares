export const PLAYER_LOGIN = "/my-games/login";
export const PLAYER_FORGOT_PASSWORD = "/my-games/forgot-password";
export const PLAYER_RESET_PASSWORD = "/my-games/reset-password";
export const MY_GAMES_HOME = "/my-games";

const PUBLIC_PLAYER_ROUTES = new Set([
  PLAYER_LOGIN,
  PLAYER_FORGOT_PASSWORD,
  PLAYER_RESET_PASSWORD,
]);

export function requiresPlayerSession(pathname: string): boolean {
  if (!pathname.startsWith("/my-games")) return false;
  if (PUBLIC_PLAYER_ROUTES.has(pathname)) return false;
  return true;
}

/** Safe post-login redirect — blocks open redirects. */
export function resolvePostLoginPath(next: string | null | undefined): string {
  if (!next?.trim()) return MY_GAMES_HOME;
  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return MY_GAMES_HOME;
  if (path.startsWith(PLAYER_LOGIN)) return MY_GAMES_HOME;
  return path;
}

export function redirectToPlayerLogin(requestUrl: string, error?: string) {
  const loginUrl = new URL(PLAYER_LOGIN, requestUrl);
  if (error) loginUrl.searchParams.set("error", error);
  return loginUrl;
}
