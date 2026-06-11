import { isDatabaseConfigured } from "@/lib/database/client";
import { isPhase2Read } from "@/lib/database/config";
import {
  dbLoadWinnerHistory,
  dbSaveWinnerHistory,
  dbUpsertWinner,
} from "@/lib/database/services/winners";
import { attachPayoutToWinner } from "./poolFinance";
import type { Pool, ScoringPeriod, WinnerHistory, WinnerResult } from "./types";
import { withRecordedAt } from "./winnerHistoryUtils";

const PREFIX = "sports-squares-winners-";

function loadLocalWinnerHistory(poolId: string): WinnerHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFIX + poolId);
    if (!raw) return {};
    return JSON.parse(raw) as WinnerHistory;
  } catch {
    return {};
  }
}

function saveLocalWinnerHistory(poolId: string, history: WinnerHistory): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + poolId, JSON.stringify(history));
}

export async function loadWinnerHistory(poolId: string): Promise<WinnerHistory> {
  if (isDatabaseConfigured()) {
    try {
      const fromDb = await dbLoadWinnerHistory(poolId);
      const hasDbData = Object.keys(fromDb).length > 0;
      if (hasDbData || isPhase2Read()) return fromDb;

      const local = loadLocalWinnerHistory(poolId);
      if (Object.keys(local).length > 0) {
        await dbSaveWinnerHistory(poolId, local).catch(() => undefined);
        return local;
      }
      return fromDb;
    } catch {
      if (!isPhase2Read()) return loadLocalWinnerHistory(poolId);
      return {};
    }
  }

  return loadLocalWinnerHistory(poolId);
}

export async function saveWinnerHistory(
  poolId: string,
  history: WinnerHistory
): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await dbSaveWinnerHistory(poolId, history);
    } catch {
      // continue to local fallback in phase 1
    }
  }

  if (!isPhase2Read()) {
    saveLocalWinnerHistory(poolId, history);
  }
}

export async function saveWinnerResult(
  poolId: string,
  result: WinnerResult,
  history: WinnerHistory,
  options?: { pool?: Pool; scoringPeriods?: ScoringPeriod[] }
): Promise<void> {
  let stamped = withRecordedAt(result);
  if (options?.pool) {
    stamped = attachPayoutToWinner(
      stamped,
      options.pool,
      options.scoringPeriods
    );
  }
  const nextHistory = { ...history, [stamped.quarter]: stamped };

  if (isDatabaseConfigured()) {
    try {
      await dbUpsertWinner(poolId, stamped);
    } catch {
      // fall through
    }
  }

  await saveWinnerHistory(poolId, nextHistory);
}
