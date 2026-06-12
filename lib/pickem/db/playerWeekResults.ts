import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type { PickemPlayerWeekStatus } from "@/lib/pickem/types";

const TABLE = "pickem_player_week_results";

export interface PickemPlayerWeekResult {
  contestId: string;
  leagueId: string;
  email: string;
  sundayWins: number;
  sundayLosses: number;
  sundayRecord: string;
  status: PickemPlayerWeekStatus;
  finishPlace: number | null;
  payoutCents: number;
}

function mapRow(row: Record<string, unknown>): PickemPlayerWeekResult {
  return {
    contestId: row.contest_id as string,
    leagueId: row.league_id as string,
    email: row.email as string,
    sundayWins: row.sunday_wins as number,
    sundayLosses: row.sunday_losses as number,
    sundayRecord: row.sunday_record as string,
    status: row.status as PickemPlayerWeekStatus,
    finishPlace: (row.finish_place as number | null) ?? null,
    payoutCents: row.payout_cents as number,
  };
}

export async function getPlayerWeekResult(input: {
  contestId: string;
  leagueId: string;
  email: string;
}): Promise<PickemPlayerWeekResult | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("contest_id", input.contestId)
    .eq("league_id", input.leagueId)
    .eq("email", normalizeEmail(input.email))
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertPlayerWeekResult(
  result: PickemPlayerWeekResult
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).upsert(
    {
      contest_id: result.contestId,
      league_id: result.leagueId,
      email: normalizeEmail(result.email),
      sunday_wins: result.sundayWins,
      sunday_losses: result.sundayLosses,
      sunday_record: result.sundayRecord,
      status: result.status,
      finish_place: result.finishPlace,
      payout_cents: result.payoutCents,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "contest_id,league_id,email" }
  );

  if (error) throw error;
}

export async function listPlayerWeekResultsForLeague(
  leagueId: string
): Promise<PickemPlayerWeekResult[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("league_id", leagueId);

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function countTiebreakerPlayers(leagueId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("league_id", leagueId)
    .eq("status", "tiebreaker");

  if (error) throw error;
  return count ?? 0;
}
