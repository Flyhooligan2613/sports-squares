const CACHE_PREFIX = "sb:fast:";

interface CacheEntry<T> {
  data: T;
  at: number;
}

export function readCachedJson<T>(key: string, maxAgeMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.at > maxAgeMs) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function writeCachedJson<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, at: Date.now() };
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    /* ignore quota */
  }
}

export async function fastFetchJson<T>(
  key: string,
  url: string,
  options: {
    maxAgeMs?: number;
    init?: RequestInit;
  } = {}
): Promise<T> {
  const maxAgeMs = options.maxAgeMs ?? 30_000;
  const cached = readCachedJson<T>(key, maxAgeMs);
  if (cached) {
    void fetchFresh(key, url, options.init);
    return cached;
  }
  return fetchFresh(key, url, options.init);
}

async function fetchFresh<T>(key: string, url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    credentials: init?.credentials ?? "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  const data = (await res.json()) as T;
  writeCachedJson(key, data);
  return data;
}

export function prefetchRoutes(paths: string[]): void {
  if (typeof window === "undefined") return;
  for (const path of paths) {
    try {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = path;
      document.head.appendChild(link);
    } catch {
      /* ignore */
    }
  }
}

export function isDocumentVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}
