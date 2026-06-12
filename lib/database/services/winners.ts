import type { PayoutStatus, WinnerHistory, WinnerResult } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getDatabaseClient } from "../client";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { TABLES } from "../config";
import { winnerResultToRow, winnerRowsToHistory } from "../mappers";
import type { WinnerRow } from "../types";

function getWinnersClient() {
  return isSupabaseAdminConfigured() ? getSupabaseAdmin() : getDatabaseClient();
}

export async function dbLoadWinnerHistory(poolId: string): Promise<WinnerHistory> {
  const supabase = getWinnersClient();
  const { data, error } = await supabase
    .from(TABLES.winners)
    .select("*")
    .eq("pool_id", poolId);

  if (error) throw error;
  return winnerRowsToHistory((data ?? []) as WinnerRow[]);
}

export async function dbSaveWinnerHistory(
  poolId: string,
  history: WinnerHistory
): Promise<void> {
  const supabase = getWinnersClient();
  const entries = Object.values(history).filter(Boolean) as WinnerResult[];

  for (const result of entries) {
    const row = winnerResultToRow(poolId, result, generateId());
    const { error } = await supabase.from(TABLES.winners).upsert(row, {
      onConflict: "pool_id,quarter",
    });
    if (error) throw error;
  }
}

export async function dbUpsertWinner(
  poolId: string,
  result: WinnerResult,
  winnerId?: string
): Promise<string> {
  const supabase = getWinnersClient();
  const id = winnerId ?? generateId();
  const row = winnerResultToRow(poolId, result, id);
  const { error } = await supabase.from(TABLES.winners).upsert(row, {
    onConflict: "pool_id,quarter",
  });
  if (error) throw error;
  return id;
}

export async function dbUpdateWinnerPayoutStatus(
  poolId: string,
  quarter: WinnerResult["quarter"],
  payoutStatus: PayoutStatus
): Promise<void> {
  const supabase = getWinnersClient();
  const { error } = await supabase
    .from(TABLES.winners)
    .update({ payout_status: payoutStatus })
    .eq("pool_id", poolId)
    .eq("quarter", quarter);
  if (error) throw error;
}

export async function dbRecalculateWinnerPayouts(
  poolId: string,
  history: WinnerHistory
): Promise<void> {
  const supabase = getWinnersClient();
  const entries = Object.values(history).filter(Boolean) as WinnerResult[];

  for (const result of entries) {
    const row = winnerResultToRow(poolId, result, generateId());
    const { error } = await supabase
      .from(TABLES.winners)
      .update({
        payout_amount: row.payout_amount,
        payout_status: row.payout_status,
      })
      .eq("pool_id", poolId)
      .eq("quarter", result.quarter);
    if (error) throw error;
  }
}
