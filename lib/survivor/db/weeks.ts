import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SurvivorWeekStatus } from "@/lib/survivor/types";

const TABLE = "survivor_weeks";

export interface SurvivorWeek {
  id: string;
  leagueId: string;
  weekNumber: number;
  label: string;
  status: SurvivorWeekStatus;
  opensAt: string | null;
  locksAt: string | null;
  completesAt: string | null;
  playersRemaining: number;
  eliminatedCount: number;
}

interface WeekRow {
  id: string;
  league_id: string;
  week_number: number;
  label: string;
  status: SurvivorWeekStatus;
  opens_at: string | null;
  locks_at: string | null;
  completes_at: string | null;
  players_remaining: number;
  eliminated_count: number;
}

function mapWeek(row: WeekRow): SurvivorWeek {
  return {
    id: row.id,
    leagueId: row.league_id,
    weekNumber: row.week_number,
    label: row.label,
    status: row.status,
    opensAt: row.opens_at,
    locksAt: row.locks_at,
    completesAt: row.completes_at,
    playersRemaining: row.players_remaining,
    eliminatedCount: row.eliminated_count,
  };
}

export async function upsertSurvivorWeek(input: {
  leagueId: string;
  weekNumber: number;
  label: string;
  status?: SurvivorWeekStatus;
}): Promise<SurvivorWeek> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from(TABLE)
    .select("*")
    .eq("league_id", input.leagueId)
    .eq("week_number", input.weekNumber)
    .maybeSingle();

  if (existing) return mapWeek(existing as WeekRow);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      league_id: input.leagueId,
      week_number: input.weekNumber,
      label: input.label,
      status: input.status ?? "scheduled",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapWeek(data as WeekRow);
}

export async function getSurvivorWeek(
  leagueId: string,
  weekNumber: number
): Promise<SurvivorWeek | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("league_id", leagueId)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (error) throw error;
  return data ? mapWeek(data as WeekRow) : null;
}

export async function getSurvivorWeekById(id: string): Promise<SurvivorWeek | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapWeek(data as WeekRow) : null;
}

export async function listSurvivorWeeks(leagueId: string): Promise<SurvivorWeek[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("league_id", leagueId)
    .order("week_number");

  if (error) throw error;
  return ((data ?? []) as WeekRow[]).map(mapWeek);
}

export async function getCurrentSurvivorWeek(
  leagueId: string
): Promise<SurvivorWeek | null> {
  const weeks = await listSurvivorWeeks(leagueId);
  return (
    weeks.find((w) => w.status !== "complete") ??
    weeks[weeks.length - 1] ??
    null
  );
}

export async function updateSurvivorWeekStatus(
  weekId: string,
  status: SurvivorWeekStatus,
  extra?: Partial<{
    locks_at: string;
    completes_at: string;
    opens_at: string;
  }>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    })
    .eq("id", weekId);

  if (error) throw error;
}

export async function refreshSurvivorWeekCounts(
  weekId: string,
  counts: { playersRemaining: number; eliminatedCount: number }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      players_remaining: counts.playersRemaining,
      eliminated_count: counts.eliminatedCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", weekId);

  if (error) throw error;
}
