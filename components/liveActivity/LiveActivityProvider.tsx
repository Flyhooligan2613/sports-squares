"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  getLiveActivityService,
  subscribeLiveActivity,
} from "@/lib/liveActivity/LiveActivityService";
import { createMockLiveActivitySeed } from "@/lib/liveActivity/mockData";
import type { LiveActivityEvent, LiveActivityInput } from "@/lib/liveActivity/types";

interface LiveActivityContextValue {
  addLiveActivity: (input: LiveActivityInput) => LiveActivityEvent;
  peekNext: () => LiveActivityEvent | null;
  advance: () => LiveActivityEvent | null;
  version: number;
}

const LiveActivityContext = createContext<LiveActivityContextValue | null>(null);

const POLL_MS = 60_000;

export function LiveActivityProvider({ children }: { children: ReactNode }) {
  const serviceRef = useRef(getLiveActivityService());
  const seededRef = useRef(false);
  const [version, bumpVersion] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    serviceRef.current.seed(createMockLiveActivitySeed());
    bumpVersion();
  }, []);

  useEffect(() => {
    return subscribeLiveActivity(() => bumpVersion());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/live-activity", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { events?: LiveActivityEvent[] };
        if (data.events?.length) {
          serviceRef.current.ingestMany(data.events);
        }
      } catch {
        /* mock seed remains */
      }
    }

    void poll();
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const addLiveActivity = useCallback((input: LiveActivityInput) => {
    return serviceRef.current.addLiveActivity(input);
  }, []);

  const value = useMemo<LiveActivityContextValue>(
    () => ({
      addLiveActivity,
      peekNext: () => serviceRef.current.peekNext(),
      advance: () => {
        const next = serviceRef.current.advance();
        bumpVersion();
        return next;
      },
      version,
    }),
    [addLiveActivity, version]
  );

  return (
    <LiveActivityContext.Provider value={value}>{children}</LiveActivityContext.Provider>
  );
}

export function useLiveActivity() {
  const context = useContext(LiveActivityContext);
  if (!context) {
    throw new Error("useLiveActivity must be used within LiveActivityProvider");
  }
  return context;
}

export function useLiveActivitySafe() {
  return useContext(LiveActivityContext);
}

export { addLiveActivity } from "@/lib/liveActivity/LiveActivityService";
