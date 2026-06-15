"use client";

import { useEffect } from "react";
import { parseHubHash, scrollToHubSection } from "@/lib/home/hubSections";

const RETRY_MS = [80, 200, 420, 700, 1100, 1600];

/** Scroll to `#section` after hub content mounts (Game Day / Game Room). */
export function useHubHashScroll(ready: boolean, deps: unknown[] = []) {
  useEffect(() => {
    if (!ready) return;

    const timers: number[] = [];

    function runScroll() {
      const hash = parseHubHash();
      if (!hash) return false;
      return scrollToHubSection(hash);
    }

    function scheduleRetries() {
      for (const delay of RETRY_MS) {
        timers.push(
          window.setTimeout(() => {
            runScroll();
          }, delay)
        );
      }
    }

    scheduleRetries();
    window.addEventListener("hashchange", runScroll);

    return () => {
      for (const id of timers) window.clearTimeout(id);
      window.removeEventListener("hashchange", runScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit hub readiness + caller deps
  }, [ready, ...deps]);
}
