import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { ContestOperationsSummary } from "../types";

export async function fetchContestOperationsSummary(): Promise<ContestOperationsSummary> {
  const empty: ContestOperationsSummary = {
    activePools: 0,
    openPools: 0,
    lockedPools: 0,
    pickemContestsOpen: 0,
    pickemContestsActive: 0,
    averageFillRatePercent: 0,
    recentPools: [],
  };

  if (!isSupabaseAdminConfigured()) return empty;

  const supabase = getSupabaseAdmin();

  const [openRes, lockedRes, activeRes, pickemOpenRes, pickemActiveRes, recentPoolsRes] =
    await Promise.all([
      supabase.from("pools").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("pools").select("id", { count: "exact", head: true }).eq("status", "locked"),
      supabase
        .from("pools")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "locked", "numbers-drawn"]),
      supabase
        .from("pickem_contests")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("pickem_contests")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("pools")
        .select("id, name, status, home_team, away_team")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const recentPools = await Promise.all(
    (recentPoolsRes.data ?? []).map(async (pool) => {
      const [{ count: claimed }, { count: players }] = await Promise.all([
        supabase
          .from("squares")
          .select("id", { count: "exact", head: true })
          .eq("pool_id", pool.id)
          .eq("claimed", true),
        supabase
          .from("players")
          .select("id", { count: "exact", head: true })
          .eq("pool_id", pool.id),
      ]);

      return {
        id: pool.id as string,
        name: pool.name as string,
        status: pool.status as string,
        homeTeam: pool.home_team as string,
        awayTeam: pool.away_team as string,
        playerCount: players ?? 0,
        squareFillPercent: Math.min(100, Math.round(((claimed ?? 0) / 100) * 100)),
      };
    })
  );

  const fillRates = recentPools.map((p) => p.squareFillPercent);
  const averageFillRatePercent =
    fillRates.length > 0
      ? Math.round(fillRates.reduce((a, b) => a + b, 0) / fillRates.length)
      : 0;

  return {
    activePools: activeRes.count ?? 0,
    openPools: openRes.count ?? 0,
    lockedPools: lockedRes.count ?? 0,
    pickemContestsOpen: pickemOpenRes.count ?? 0,
    pickemContestsActive: pickemActiveRes.count ?? 0,
    averageFillRatePercent,
    recentPools,
  };
}
