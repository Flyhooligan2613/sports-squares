"use client";

import { useEffect } from "react";
import { emitLiveTvSound, subscribeLiveTvSound } from "@/lib/liveTv/soundEvents";
import type { LiveTvSoundEvent } from "@/lib/liveTv/types";

/** Hook for future audio — currently no-op unless handlers are registered. */
export function useLiveTvSound(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    return subscribeLiveTvSound((_event) => {
      // Audio will be wired here later.
    });
  }, [enabled]);
}

export function triggerLiveTvSound(event: LiveTvSoundEvent, payload?: unknown) {
  emitLiveTvSound(event, payload);
}
