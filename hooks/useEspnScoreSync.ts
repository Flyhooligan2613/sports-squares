"use client";

import { useEffect, useRef, useState } from "react";
import { fetchEspnGame } from "@/lib/espn/clientFetch";
import { detectWinnersToSync } from "@/lib/espn/sync";
import { normalizeEspnSport } from "@/lib/espn/sports";
import type {
  EspnLiveGame,
  EspnSport,
  Pool,
  ScoringPeriod,
  Square,
  WinnerHistory,
  WinnerResult,
} from "@/lib/types";
import { saveWinnerResult } from "@/lib/winnerStorage";

const POLL_INTERVAL_MS = 60_000;

interface UseEspnScoreSyncOptions {
  poolId: string;
  espnGameId?: string;
  espnSport?: EspnSport | null;
  enabled: boolean;
  topNumbers?: number[];
  sideNumbers?: number[];
  squares: Square[];
  winnerHistory: WinnerHistory;
  pool?: Pool | null;
  scoringPeriods?: ScoringPeriod[];
  onWinnersSynced: (results: WinnerResult[]) => void;
  onLiveGameUpdate?: (game: EspnLiveGame) => void;
}

export function useEspnScoreSync({
  poolId,
  espnGameId,
  espnSport,
  enabled,
  topNumbers,
  sideNumbers,
  squares,
  winnerHistory,
  pool,
  scoringPeriods,
  onWinnersSynced,
  onLiveGameUpdate,
}: UseEspnScoreSyncOptions) {
  const [liveGame, setLiveGame] = useState<EspnLiveGame | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sport = normalizeEspnSport(espnSport);

  const historyRef = useRef(winnerHistory);
  historyRef.current = winnerHistory;

  const squaresRef = useRef(squares);
  squaresRef.current = squares;

  useEffect(() => {
    if (!enabled || !espnGameId || !topNumbers?.length || !sideNumbers?.length) {
      return;
    }

    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      setSyncing(true);

      try {
        const game = await fetchEspnGame(espnGameId!, sport);
        if (cancelled) return;

        setLiveGame(game);
        setSyncError(null);
        setLastSyncAt(new Date());
        onLiveGameUpdate?.(game);

        const newWinners = detectWinnersToSync(
          game,
          historyRef.current,
          topNumbers!,
          sideNumbers!,
          squaresRef.current,
          sport
        );

        if (newWinners.length > 0) {
          let history = { ...historyRef.current };

          for (const result of newWinners) {
            history = { ...history, [result.quarter]: result };
            await saveWinnerResult(poolId, result, history, {
              pool: pool ?? undefined,
              scoringPeriods,
            });
            historyRef.current = history;
          }

          onWinnersSynced(newWinners);
        }
      } catch (err) {
        if (!cancelled) {
          setSyncError(
            err instanceof Error ? err.message : "ESPN sync failed"
          );
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    enabled,
    espnGameId,
    sport,
    poolId,
    topNumbers,
    sideNumbers,
    pool,
    scoringPeriods,
    onWinnersSynced,
    onLiveGameUpdate,
  ]);

  return {
    liveGame,
    syncing,
    lastSyncAt,
    syncError,
    isActive: Boolean(enabled && espnGameId),
  };
}
