"use client";

import { useEffect, useRef } from "react";
import type { GenesisMissionId } from "@/lib/platform/engines/genesis";

/** Tracks page-visit missions for authenticated users (works outside GenesisProvider). */
export default function GenesisVisitTracker({ missionId }: { missionId: GenesisMissionId }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void fetch("/api/genesis/complete-mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ missionId }),
    }).catch(() => undefined);
  }, [missionId]);

  return null;
}
