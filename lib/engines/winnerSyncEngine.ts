import { parseEspnSummary } from "@/lib/espn/parser";
import { getEspnSportConfig } from "@/lib/espn/sports";
import { detectWinnersToSync } from "@/lib/espn/sync";
import { assemblePool } from "@/lib/database/mappers";
import { TABLES } from "@/lib/database/config";
import { dbLoadWinnerHistory, dbUpsertWinner } from "@/lib/database/services/winners";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PlayerRow, PoolRow, SquareRow } from "@/lib/database/types";
import { attachPayoutToWinner } from "@/lib/poolFinance";
import { getScoringPeriods, normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnLiveGame, EspnSport, WinnerResult } from "@/lib/types";
import { withRecordedAt } from "@/lib/winnerHistoryUtils";

async function fetchEspnGameServer(
  gameId: string,
  sport: EspnSport
): Promise<EspnLiveGame | null> {
  try {
    const config = getEspnSportConfig(sport);
    const response = await fetch(`${config.summaryUrl}?event=${gameId}`, {
      headers: { "User-Agent": "SquareBoards/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return parseEspnSummary(data, gameId);
  } catch {
    return null;
  }
}

export interface WinnerSyncResult {
  poolsChecked: number;
  winnersRecorded: number;
  poolsCompleted: number;
  errors: string[];
}

export async function syncAllPoolWinners(): Promise<WinnerSyncResult> {
  const result: WinnerSyncResult = {
    poolsChecked: 0,
    winnersRecorded: 0,
    poolsCompleted: 0,
    errors: [],
  };

  if (!isSupabaseAdminConfigured()) return result;

  const supabase = getSupabaseAdmin();
  const { data: poolRows, error } = await supabase
    .from(TABLES.pools)
    .select("*")
    .in("status", ["numbers-drawn", "completed"])
    .not("espn_game_id", "is", null);

  if (error) throw error;
  if (!poolRows?.length) return result;

  for (const poolRow of poolRows as PoolRow[]) {
    if (
      !poolRow.top_numbers?.length ||
      !poolRow.side_numbers?.length ||
      poolRow.top_numbers.length !== 10 ||
      poolRow.side_numbers.length !== 10
    ) {
      continue;
    }

    result.poolsChecked += 1;

    try {
      const [playersRes, squaresRes] = await Promise.all([
        supabase.from(TABLES.players).select("*").eq("pool_id", poolRow.id),
        supabase
          .from(TABLES.squares)
          .select("*")
          .eq("pool_id", poolRow.id)
          .order("square_number"),
      ]);

      if (playersRes.error) throw playersRes.error;
      if (squaresRes.error) throw squaresRes.error;

      const pool = assemblePool(
        poolRow,
        (playersRes.data ?? []) as PlayerRow[],
        (squaresRes.data ?? []) as SquareRow[]
      );

      const sport = normalizeEspnSport(pool.espnSport);
      const game = await fetchEspnGameServer(poolRow.espn_game_id!, sport);
      if (!game) continue;

      const history = await dbLoadWinnerHistory(poolRow.id);
      const newWinners = detectWinnersToSync(
        game,
        history,
        pool.topNumbers!,
        pool.sideNumbers!,
        pool.squares,
        pool.espnSport
      );

      if (newWinners.length === 0) continue;

      const scoringPeriods = getScoringPeriods(sport);

      for (const winner of newWinners) {
        let stamped: WinnerResult = withRecordedAt(winner);
        stamped = attachPayoutToWinner(stamped, pool, scoringPeriods);
        await dbUpsertWinner(poolRow.id, stamped);
        result.winnersRecorded += 1;
      }

      const hasFinal = newWinners.some((w) => w.quarter === "FINAL");
      if (hasFinal && poolRow.status !== "completed") {
        const { error: completeError } = await supabase
          .from(TABLES.pools)
          .update({ status: "completed" })
          .eq("id", poolRow.id);

        if (!completeError) result.poolsCompleted += 1;
      }
    } catch (err) {
      result.errors.push(
        `${poolRow.id}: ${err instanceof Error ? err.message : "sync failed"}`
      );
    }
  }

  return result;
}
