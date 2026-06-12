import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type { PickemPlayerWeekStatus, PickemSport, PickemWeekHistoryEntry } from "@/lib/pickem/types";

const TABLE = "pickem_week_history";

export type { PickemWeekHistoryEntry };

function mapRow(row: Record<string, unknown>): PickemWeekHistoryEntry {
  return {
    id: row.id as string,
    email: row.email as string,
    contestId: row.contest_id as string,
    leagueId: (row.league_id as string | null) ?? null,
    sport: row.sport as PickemSport,
    seasonYear: row.season_year as number,
    weekLabel: row.week_label as string,
    entryTierCents: row.entry_tier_cents as number,
    poolNumber: row.pool_number as number,
    weeklyRecord: row.weekly_record as string,
    finishPlace: (row.finish_place as number | null) ?? null,
    status: row.status as PickemPlayerWeekStatus,
    earningsCents: row.earnings_cents as number,
    tiebreakerUsed: row.tiebreaker_used as boolean,
    createdAt: row.created_at as string,
  };
}

export async function savePickemWeekHistory(input: {
  email: string;
  contestId: string;
  leagueId: string;
  sport: PickemSport;
  seasonYear: number;
  weekLabel: string;
  entryTierCents: number;
  poolNumber: number;
  weeklyRecord: string;
  finishPlace: number | null;
  status: PickemPlayerWeekStatus;
  earningsCents: number;
  tiebreakerUsed: boolean;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).upsert(
    {
      email: normalizeEmail(input.email),
      contest_id: input.contestId,
      league_id: input.leagueId,
      sport: input.sport,
      season_year: input.seasonYear,
      week_label: input.weekLabel,
      entry_tier_cents: input.entryTierCents,
      pool_number: input.poolNumber,
      weekly_record: input.weeklyRecord,
      finish_place: input.finishPlace,
      status: input.status,
      earnings_cents: input.earningsCents,
      tiebreaker_used: input.tiebreakerUsed,
    },
    { onConflict: "email,contest_id,league_id" }
  );

  if (error) throw error;
}

export async function listPickemWeekHistory(
  email: string,
  limit = 50
): Promise<PickemWeekHistoryEntry[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getPickemHistorySummary(email: string): Promise<{
  seasonRecord: string;
  bestFinish: number | null;
  perfectWeeks: number;
  mondayTiebreakerWins: number;
  longestWinStreak: number;
  lifetimePickemWins: number;
  lifetimeEarningsCents: number;
  weeks: PickemWeekHistoryEntry[];
}> {
  const { getPickemPlayerStats } = await import("@/lib/pickem/db/stats");
  const stats = await getPickemPlayerStats(
    email,
    "nfl",
    new Date().getFullYear()
  );
  const weeks = await listPickemWeekHistory(email);

  return {
    seasonRecord: `${stats.seasonWins}-${stats.seasonLosses}`,
    bestFinish: stats.bestFinish ?? null,
    perfectWeeks: stats.perfectWeeks,
    mondayTiebreakerWins: stats.mondayTiebreakerWins,
    longestWinStreak: stats.longestStreak,
    lifetimePickemWins: stats.lifetimePickemWins,
    lifetimeEarningsCents: stats.lifetimeEarningsCents,
    weeks,
  };
}
