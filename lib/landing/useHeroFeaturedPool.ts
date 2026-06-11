"use client";

import { useEffect, useState } from "react";
import { fetchEspnGame } from "@/lib/espn/clientFetch";
import { poolStore } from "@/lib/poolStore";
import type { EspnLiveGame, Pool } from "@/lib/types";

function pickFeaturedPool(pools: Pool[]): Pool | null {
  const visible = pools
    .filter((p) => p.status !== "archived")
    .sort((a, b) => {
      const aOpen = a.status === "open" ? 0 : 1;
      const bOpen = b.status === "open" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return a.name.localeCompare(b.name);
    });
  return visible.find((p) => p.status === "open") ?? visible[0] ?? null;
}

export function useHeroFeaturedPool() {
  const [pool, setPool] = useState<Pool | null>(null);
  const [liveGame, setLiveGame] = useState<EspnLiveGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const all = await poolStore.listPools();
        if (cancelled) return;

        const featured = pickFeaturedPool(all);
        setPool(featured);

        if (featured?.espnGameId) {
          try {
            const game = await fetchEspnGame(
              featured.espnGameId,
              featured.espnSport
            );
            if (!cancelled) setLiveGame(game);
          } catch {
            /* fall back to pool team names */
          }
        }
      } catch {
        if (!cancelled) setPool(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { pool, liveGame, loading };
}

export function teamAbbrev(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z]/g, "");
  if (cleaned.length <= 3) return cleaned.toUpperCase();
  return cleaned.slice(0, 3).toUpperCase();
}

export function squaresRemaining(pool: Pool): number {
  return pool.squares.filter((s) => !s.claimed).length;
}

export function formatPoolPrice(pool: Pool): string {
  const cost = pool.costPerSquare ?? 0;
  if (cost <= 0) return "Free";
  return `$${cost.toFixed(0)}`;
}
