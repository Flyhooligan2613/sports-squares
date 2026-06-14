export const SURVIVOR_BASE_PATH = "/survivor";

export function survivorPath(...segments: string[]): string {
  const tail = segments.filter(Boolean).join("/");
  return tail ? `${SURVIVOR_BASE_PATH}/${tail}` : SURVIVOR_BASE_PATH;
}

export function survivorApiUrl(
  path: string,
  query?: Record<string, string | number | undefined>
): string {
  const base = path.startsWith("/") ? path : `/api/survivor/${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
