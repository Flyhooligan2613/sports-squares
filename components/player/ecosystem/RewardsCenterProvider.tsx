"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { getRewardsCenterData } from "@/lib/platform/ecosystem/rewardsCenter";

export type RewardsCenterData = Awaited<ReturnType<typeof getRewardsCenterData>>;

interface RewardsCenterContextValue {
  data: RewardsCenterData | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { background?: boolean }) => Promise<void>;
}

const RewardsCenterContext = createContext<RewardsCenterContextValue | null>(null);

export function RewardsCenterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RewardsCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { background?: boolean }) => {
    if (!options?.background) setLoading(true);
    const res = await fetch("/api/ecosystem/rewards-center", {
      cache: "no-store",
      credentials: "include",
    });
    const json = (await res.json()) as RewardsCenterData & { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not load rewards.");
      if (!options?.background) setLoading(false);
      return;
    }
    setData(json);
    setError(null);
    if (!options?.background) setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, error, refresh }),
    [data, loading, error, refresh]
  );

  return (
    <RewardsCenterContext.Provider value={value}>{children}</RewardsCenterContext.Provider>
  );
}

export function useRewardsCenter() {
  const ctx = useContext(RewardsCenterContext);
  if (!ctx) {
    throw new Error("useRewardsCenter must be used within RewardsCenterProvider");
  }
  return ctx;
}
