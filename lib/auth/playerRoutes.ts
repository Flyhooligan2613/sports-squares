export const PLAYER_LOGIN = "/my-games/login";
export const MY_GAMES_HOME = "/my-games";

export function requiresPlayerSession(pathname: string): boolean {
  if (!pathname.startsWith("/my-games")) return false;
  if (pathname === PLAYER_LOGIN) return false;
  return true;
}

export function redirectToPlayerLogin(requestUrl: string, error?: string) {
  const loginUrl = new URL(PLAYER_LOGIN, requestUrl);
  if (error) loginUrl.searchParams.set("error", error);
  return loginUrl;
}
