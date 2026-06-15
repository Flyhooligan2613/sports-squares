"use client";

import { useEffect } from "react";
import { resolveHubTargetHash, scrollToHubSection } from "@/lib/home/hubSections";

const RETRY_MS = [0, 80, 200, 420, 700, 1100, 1600, 2200, 3000];

/** Scroll to `#section` after hub content mounts (Game Day / Game Room). */
export function useHubHashScroll(ready: boolean, deps: unknown[] = []) {
  useEffect(() => {
    if (!ready) return;

    const timers: number[] = [];

    function runScroll() {
      const hash = resolveHubTargetHash();
      if (!hash) return false;
      const scrolled = scrollToHubSection(hash);
      if (scrolled && window.location.hash !== `#${hash}`) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${hash}`);
      }
      return scrolled;
    }

    function scheduleRetries() {
      for (const delay of RETRY_MS) {
        timers.push(window.setTimeout(runScroll, delay));
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
