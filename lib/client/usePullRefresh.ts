"use client";

import { useEffect, useRef } from "react";

/** Re-run data loaders when the global pull-to-refresh fires. */
export function usePullRefresh(onRefresh: () => void | Promise<void>) {
  const handlerRef = useRef(onRefresh);
  handlerRef.current = onRefresh;

  useEffect(() => {
    function onPullRefresh() {
      void handlerRef.current();
    }
    window.addEventListener("sb:pull-refresh", onPullRefresh);
    return () => window.removeEventListener("sb:pull-refresh", onPullRefresh);
  }, []);
}
