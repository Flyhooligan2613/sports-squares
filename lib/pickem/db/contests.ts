import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  PickemContest,
  PickemContestStatus,
  PickemSport,
} from "@/lib/pickem/types";
import { formatPickemWeekLabel, PICKEM_DEFAULT_PRIZE_POOL_CENTS } from "@/lib/pickem/config";

const TABLE = "pickem_contests";

interface ContestRow {
  id: string;
  sport: PickemSport;
  season_year: number;
  season_type: number;
  week_number: number;
  label: string;
  status: PickemContestStatus;
  prize_pool_cents: number;
  player_count: number;
  payout_status?: string;
}

function mapContest(row: ContestRow): PickemContest {
  return {
    id: row.id,
    sport: row.sport,
    seasonYear: row.season_year,
    seasonType: row.season_type,
    weekNumber: row.week_number,
    label: row.label,
    status: row.status,
    prizePoolCents: row.prize_pool_cents,
    playerCount: row.player_count,
    payoutStatus: (row.payout_status as PickemContest["payoutStatus"]) ?? "none",
  };
}

export async function getPickemContestById(
  contestId: string
): Promise<PickemContest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", contestId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapContest(data as ContestRow) : null;
}

export async function getPickemContestForWeek(input: {
  sport: PickemSport;
  seasonYear: number;
  seasonType: number;
  weekNumber: number;
}): Promise<PickemContest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", input.sport)
    .eq("season_year", input.seasonYear)
    .eq("season_type", input.seasonType)
    .eq("week_number", input.weekNumber)
    .maybeSingle();

  if (error) throw error;
  return data ? mapContest(data as ContestRow) : null;
}

export async function getCurrentPickemContest(
  sport: PickemSport
): Promise<PickemContest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .neq("status", "complete")
    .order("season_year", { ascending: false })
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return mapContest(data as ContestRow);

  const { data: latest, error: latestError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .order("season_year", { ascending: false })
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;
  return latest ? mapContest(latest as ContestRow) : null;
}

export async function upsertPickemContest(input: {
  sport: PickemSport;
  seasonYear: number;
  seasonType: number;
  weekNumber: number;
  label?: string;
  status?: PickemContestStatus;
  prizePoolCents?: number;
}): Promise<PickemContest> {
  const supabase = getSupabaseAdmin();
  const label =
    input.label ??
    formatPickemWeekLabel(input.weekNumber, input.seasonType);

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        sport: input.sport,
        season_year: input.seasonYear,
        season_type: input.seasonType,
        week_number: input.weekNumber,
        label,
        status: input.status ?? "open",
        prize_pool_cents: input.prizePoolCents ?? PICKEM_DEFAULT_PRIZE_POOL_CENTS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sport,season_year,season_type,week_number" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapContest(data as ContestRow);
}

export async function updatePickemContestStatus(
  contestId: string,
  status: PickemContestStatus
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", contestId);

  if (error) throw error;
}

export async function updatePickemContestPayoutStatus(
  contestId: string,
  payoutStatus: "none" | "pending" | "processing" | "paid" | "skipped"
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      payout_status: payoutStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contestId);

  if (error) throw error;
}

export async function refreshPickemContestPlayerCount(
  contestId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase
    .from("pickem_picks")
    .select("email", { count: "exact", head: true })
    .eq("contest_id", contestId);

  if (countError) throw countError;

  const { data, error } = await supabase
    .from("pickem_picks")
    .select("email")
    .eq("contest_id", contestId);

  if (error) throw error;

  const unique = new Set((data ?? []).map((r) => r.email as string));
  const playerCount = unique.size;

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      player_count: playerCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contestId);

  if (updateError) throw updateError;
  void count;
  return playerCount;
}

export async function listPickemContestsForSeason(input: {
  sport: PickemSport;
  seasonYear: number;
}): Promise<PickemContest[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", input.sport)
    .eq("season_year", input.seasonYear)
    .order("season_type", { ascending: true })
    .order("week_number", { ascending: true });

  if (error) throw error;
  return (data as ContestRow[]).map(mapContest);
}

export async function listActivePickemContests(
  sport: PickemSport
): Promise<PickemContest[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", sport)
    .in("status", ["open", "active"])
    .order("season_year", { ascending: false })
    .order("season_type", { ascending: true })
    .order("week_number", { ascending: true });

  if (error) throw error;
  return (data as ContestRow[]).map(mapContest);
}

export async function getLongestActivePickemStreak(
  sport: PickemSport,
  seasonYear: number
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pickem_player_stats")
    .select("current_streak")
    .eq("sport", sport)
    .eq("season_year", seasonYear)
    .order("current_streak", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.current_streak as number | undefined) ?? 0;
}
