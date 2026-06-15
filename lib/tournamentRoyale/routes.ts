export const TOURNAMENT_ROYALE_BASE_PATH = "/tournament-royale";

export function tournamentRoyalePath(...segments: string[]): string {
  const tail = segments.filter(Boolean).join("/");
  return tail ? `${TOURNAMENT_ROYALE_BASE_PATH}/${tail}` : TOURNAMENT_ROYALE_BASE_PATH;
}

export function tournamentRoyaleApiUrl(
  path: string,
  query?: Record<string, string | number | undefined>
): string {
  const base = path.startsWith("/") ? path : `/api/tournament-royale/${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
