"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { GenesisMissionId, GenesisProgressSnapshot } from "@/lib/platform/engines/genesis";
import { normalizeGenesisProgress } from "@/lib/platform/engines/genesis/normalizeProgress";

interface GenesisContextValue {
  progress: GenesisProgressSnapshot | null;
  loading: boolean;
  refresh: () => Promise<void>;
  completeMission: (missionId: GenesisMissionId) => Promise<boolean>;
}

const GenesisContext = createContext<GenesisContextValue | null>(null);

export function GenesisProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<GenesisProgressSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/genesis/progress", { cache: "no-store", credentials: "include" });
      if (!res.ok) return;
      const json = (await res.json()) as GenesisProgressSnapshot & { initialized?: boolean };
      setProgress(normalizeGenesisProgress(json));
    } catch (err) {
      console.warn("[genesis] progress fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const completeMission = useCallback(
    async (missionId: GenesisMissionId) => {
      const res = await fetch("/api/genesis/complete-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ missionId }),
      });
      if (!res.ok) return false;
      await refresh();
      return true;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ progress, loading, refresh, completeMission }),
    [progress, loading, refresh, completeMission]
  );

  return <GenesisContext.Provider value={value}>{children}</GenesisContext.Provider>;
}

export function useGenesis() {
  const ctx = useContext(GenesisContext);
  if (!ctx) {
    throw new Error("useGenesis must be used within GenesisProvider");
  }
  return ctx;
}

export function useGenesisOptional() {
  return useContext(GenesisContext);
}

/** Auto-complete visit-tracked missions when a page mounts. */
export function useGenesisPageVisit(missionId: GenesisMissionId | null) {
  const ctx = useGenesisOptional();

  useEffect(() => {
    if (!missionId || !ctx?.progress?.rookieSeason.active) return;
    const missions = ctx.progress.missions ?? [];
    const done = missions.some((m) => m.missionId === missionId && m.status === "completed");
    if (done) return;
    void ctx.completeMission(missionId);
  }, [missionId, ctx]);
}

export function useGenesisNextStep(context: string) {
  const [step, setStep] = useState<Awaited<ReturnType<typeof fetchNextStep>>>(null);

  useEffect(() => {
    void fetchNextStep(context).then(setStep);
  }, [context]);

  return step;
}

async function fetchNextStep(context: string) {
  const res = await fetch(`/api/genesis/next-step?context=${encodeURIComponent(context)}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { nextStep?: import("@/lib/platform/engines/genesis").GenesisNextStep };
  return json.nextStep ?? null;
}
