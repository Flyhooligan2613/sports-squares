import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type { PickemTiebreakerStatus } from "@/lib/pickem/types";

const TB = "pickem_tiebreakers";
const ENTRIES = "pickem_tiebreaker_entries";

export interface PickemTiebreaker {
  id: string;
  contestId: string;
  leagueId: string;
  mondayGameId: string | null;
  status: PickemTiebreakerStatus;
  actualTotalPoints: number | null;
  winnerCount: number;
  resolvedAt: string | null;
}

export interface PickemTiebreakerEntry {
  id: string;
  tiebreakerId: string;
  email: string;
  predictedTotal: number | null;
  distance: number | null;
  submittedAt: string | null;
  lockedAt: string | null;
}

function mapTiebreaker(row: Record<string, unknown>): PickemTiebreaker {
  return {
    id: row.id as string,
    contestId: row.contest_id as string,
    leagueId: row.league_id as string,
    mondayGameId: (row.monday_game_id as string | null) ?? null,
    status: row.status as PickemTiebreakerStatus,
    actualTotalPoints: (row.actual_total_points as number | null) ?? null,
    winnerCount: row.winner_count as number,
    resolvedAt: (row.resolved_at as string | null) ?? null,
  };
}

function mapEntry(row: Record<string, unknown>): PickemTiebreakerEntry {
  return {
    id: row.id as string,
    tiebreakerId: row.tiebreaker_id as string,
    email: row.email as string,
    predictedTotal: (row.predicted_total as number | null) ?? null,
    distance: (row.distance as number | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    lockedAt: (row.locked_at as string | null) ?? null,
  };
}

export async function getTiebreakerForLeague(
  leagueId: string
): Promise<PickemTiebreaker | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TB)
    .select("*")
    .eq("league_id", leagueId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTiebreaker(data as Record<string, unknown>) : null;
}

export async function createTiebreaker(input: {
  contestId: string;
  leagueId: string;
  mondayGameId: string | null;
}): Promise<PickemTiebreaker> {
  const supabase = getSupabaseAdmin();
  const existing = await getTiebreakerForLeague(input.leagueId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from(TB)
    .insert({
      contest_id: input.contestId,
      league_id: input.leagueId,
      monday_game_id: input.mondayGameId,
      status: "active",
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const raced = await getTiebreakerForLeague(input.leagueId);
    if (raced) return raced;
    throw error;
  }
  if (error) throw error;
  return mapTiebreaker(data as Record<string, unknown>);
}

export async function updateTiebreakerStatus(
  tiebreakerId: string,
  status: PickemTiebreakerStatus,
  extra?: {
    actualTotalPoints?: number;
    winnerCount?: number;
    resolvedAt?: string;
  }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TB)
    .update({
      status,
      actual_total_points: extra?.actualTotalPoints ?? undefined,
      winner_count: extra?.winnerCount ?? undefined,
      resolved_at: extra?.resolvedAt ?? undefined,
    })
    .eq("id", tiebreakerId);

  if (error) throw error;
}

export async function ensureTiebreakerEntry(
  tiebreakerId: string,
  email: string
): Promise<PickemTiebreakerEntry> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: existing } = await supabase
    .from(ENTRIES)
    .select("*")
    .eq("tiebreaker_id", tiebreakerId)
    .eq("email", normalized)
    .maybeSingle();

  if (existing) return mapEntry(existing as Record<string, unknown>);

  const { data, error } = await supabase
    .from(ENTRIES)
    .insert({ tiebreaker_id: tiebreakerId, email: normalized })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const { data: raced } = await supabase
      .from(ENTRIES)
      .select("*")
      .eq("tiebreaker_id", tiebreakerId)
      .eq("email", normalized)
      .maybeSingle();
    if (raced) return mapEntry(raced as Record<string, unknown>);
    throw error;
  }
  if (error) throw error;
  return mapEntry(data as Record<string, unknown>);
}

export async function submitTiebreakerPrediction(input: {
  tiebreakerId: string;
  email: string;
  predictedTotal: number;
}): Promise<PickemTiebreakerEntry> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const normalized = normalizeEmail(input.email);

  const { data, error } = await supabase
    .from(ENTRIES)
    .update({
      predicted_total: input.predictedTotal,
      submitted_at: now,
    })
    .eq("tiebreaker_id", input.tiebreakerId)
    .eq("email", normalized)
    .select("*")
    .single();

  if (error) throw error;
  return mapEntry(data as Record<string, unknown>);
}

export async function lockTiebreakerEntries(tiebreakerId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(ENTRIES)
    .update({ locked_at: now })
    .eq("tiebreaker_id", tiebreakerId)
    .is("locked_at", null)
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}

export async function listTiebreakerEntries(
  tiebreakerId: string
): Promise<PickemTiebreakerEntry[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(ENTRIES)
    .select("*")
    .eq("tiebreaker_id", tiebreakerId);

  if (error) throw error;
  return (data ?? []).map((row) => mapEntry(row as Record<string, unknown>));
}

export async function getTiebreakerEntryForPlayer(input: {
  tiebreakerId: string;
  email: string;
}): Promise<PickemTiebreakerEntry | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(ENTRIES)
    .select("*")
    .eq("tiebreaker_id", input.tiebreakerId)
    .eq("email", normalizeEmail(input.email))
    .maybeSingle();

  if (error) throw error;
  return data ? mapEntry(data as Record<string, unknown>) : null;
}

export async function setTiebreakerEntryDistances(
  tiebreakerId: string,
  distances: Array<{ email: string; distance: number }>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  for (const row of distances) {
    const { error } = await supabase
      .from(ENTRIES)
      .update({ distance: row.distance })
      .eq("tiebreaker_id", tiebreakerId)
      .eq("email", normalizeEmail(row.email));

    if (error) throw error;
  }
}

export async function getTiebreakerById(
  id: string
): Promise<PickemTiebreaker | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TB).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapTiebreaker(data as Record<string, unknown>) : null;
}

export async function listActiveTiebreakersForContest(
  contestId: string
): Promise<PickemTiebreaker[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TB)
    .select("*")
    .eq("contest_id", contestId)
    .in("status", ["pending", "active", "locked"]);

  if (error) throw error;
  return (data ?? []).map((row) => mapTiebreaker(row as Record<string, unknown>));
}
