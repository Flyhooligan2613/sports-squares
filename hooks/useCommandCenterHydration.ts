"use client";

import { useEffect, useState } from "react";
import { COMMAND_CENTER_API_TIMEOUT_MS } from "@/lib/platform/engines/commandCenter/config";

export interface HydrationParseResult<T> {
  value: T;
  demo: boolean;
}

export interface CommandCenterHydration<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  hydrating: boolean;
  usingDemo: boolean;
}

/** Seed demo data instantly, then hydrate from API with timeout — never infinite skeletons. */
export function useCommandCenterHydration<T>({
  url,
  initialData,
  parse,
  timeoutMs = COMMAND_CENTER_API_TIMEOUT_MS,
}: {
  url: string;
  initialData: T;
  parse: (body: Record<string, unknown>) => HydrationParseResult<T> | null;
  timeoutMs?: number;
}): CommandCenterHydration<T> {
  const [data, setData] = useState<T>(initialData);
  const [hydrating, setHydrating] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs + 500);

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;
        const parsed = parse(body);
        if (parsed) {
          setData(parsed.value);
          setUsingDemo(parsed.demo);
        }
      })
      .catch(() => {
        if (!cancelled) setUsingDemo(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [url, timeoutMs, parse]);

  return { data, setData, hydrating, usingDemo };
}

/** One-shot fetch helper for manual reloads (alerts toggle, player search). */
export async function fetchCommandCenter<T>(
  url: string,
  parse: (body: Record<string, unknown>) => HydrationParseResult<T> | null,
  timeoutMs = COMMAND_CENTER_API_TIMEOUT_MS
): Promise<HydrationParseResult<T> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs + 500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = (await res.json()) as Record<string, unknown>;
    return parse(body);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
