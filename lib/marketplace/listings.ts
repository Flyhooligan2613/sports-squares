import { dbListGames } from "@/lib/database/services/games";
import { getEspnSportConfig, ESPN_SPORT_LIST } from "@/lib/espn/sports";
import type { EspnSport, MarketplaceSportStats } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";

async function countOpenBoardsForSport(sport: EspnSport): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(TABLES.pools)
    .select("*", { count: "exact", head: true })
    .eq("espn_sport", sport)
    .eq("status", "open")
    .eq("marketplace_visible", true);

  if (error) throw error;
  return count ?? 0;
}

async function countAvailableSquaresForSport(sport: EspnSport): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: pools, error: poolsError } = await supabase
    .from(TABLES.pools)
    .select("id")
    .eq("espn_sport", sport)
    .eq("status", "open")
    .eq("marketplace_visible", true);

  if (poolsError) throw poolsError;
  if (!pools?.length) return 0;

  const poolIds = pools.map((p) => p.id as string);
  const { count, error } = await supabase
    .from(TABLES.squares)
    .select("*", { count: "exact", head: true })
    .in("pool_id", poolIds)
    .eq("claimed", false);

  if (error) throw error;
  return count ?? 0;
}

export async function getMarketplaceSportStats(): Promise<
  MarketplaceSportStats[]
> {
  const stats: MarketplaceSportStats[] = [];

  for (const config of ESPN_SPORT_LIST) {
    const sport = config.id;
    let gameCount = 0;

    try {
      const games = await dbListGames({
        sport,
        status: ["scheduled", "live"],
      });
      gameCount = games.length;
    } catch {
      gameCount = 0;
    }

    let openBoardCount = 0;
    let squaresAvailable = 0;

    try {
      openBoardCount = await countOpenBoardsForSport(sport);
      squaresAvailable = await countAvailableSquaresForSport(sport);
    } catch {
      openBoardCount = 0;
      squaresAvailable = 0;
    }

    stats.push({
      sport,
      label: getEspnSportConfig(sport).label,
      gameCount,
      openBoardCount,
      squaresAvailable,
    });
  }

  return stats;
}

export async function getMarketplaceTotals() {
  const sportStats = await getMarketplaceSportStats();
  return {
    sports: sportStats,
    totalGames: sportStats.reduce((sum, s) => sum + s.gameCount, 0),
    totalOpenBoards: sportStats.reduce((sum, s) => sum + s.openBoardCount, 0),
    totalSquaresAvailable: sportStats.reduce(
      (sum, s) => sum + s.squaresAvailable,
      0
    ),
  };
}
