"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LiveWinnersCenterData } from "@/lib/liveWinners/types";

const POLL_MS = 30_000;

interface LandingLiveContextValue {
  data: LiveWinnersCenterData | null;
  loading: boolean;
}

const LandingLiveContext = createContext<LandingLiveContextValue>({
  data: null,
  loading: true,
});

export function useLandingLive() {
  return useContext(LandingLiveContext);
}

export function LandingLiveProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LiveWinnersCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/live-winners", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        setData((await res.json()) as LiveWinnersCenterData);
      } catch {
        // Keep the last good snapshot on transient failures.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <LandingLiveContext.Provider value={{ data, loading }}>
      {children}
    </LandingLiveContext.Provider>
  );
}
