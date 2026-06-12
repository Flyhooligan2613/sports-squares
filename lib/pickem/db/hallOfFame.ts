import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { maskPlayerLabel } from "@/lib/player/statsCore";
import { listPickemStatsForLeaderboard } from "@/lib/pickem/db/stats";
import type { PickemSeasonArchive, PickemSeasonStanding, PickemSport } from "@/lib/pickem/types";

const ARCHIVE_TABLE = "pickem_season_archives";
const STANDINGS_TABLE = "pickem_season_standings";
const TOP_N = 100;

export type { PickemSeasonArchive, PickemSeasonStanding };

function mapArchive(row: Record<string, unknown>): PickemSeasonArchive {
  return {
    id: row.id as string,
    sport: row.sport as PickemSport,
    seasonYear: row.season_year as number,
    championEmail: (row.champion_email as string | null) ?? null,
    championDisplayName: (row.champion_display_name as string | null) ?? null,
    championRecord: (row.champion_record as string | null) ?? null,
    championAccuracyPct: Number(row.champion_accuracy_pct ?? 0),
    championLongestStreak: row.champion_longest_streak as number,
    championPerfectWeeks: row.champion_perfect_weeks as number,
    championEarningsCents: row.champion_earnings_cents as number,
    totalPlayers: row.total_players as number,
    totalWeeks: row.total_weeks as number,
    archivedAt: row.archived_at as string,
  };
}

function mapStanding(row: Record<string, unknown>): PickemSeasonStanding {
  return {
    rank: row.rank as number,
    email: row.email as string,
    displayName: (row.display_name as string) ?? maskPlayerLabel(row.email as string),
    seasonWins: row.season_wins as number,
    seasonLosses: row.season_losses as number,
    pickAccuracyPct: Number(row.pick_accuracy_pct ?? 0),
    longestStreak: row.longest_streak as number,
    perfectWeeks: row.perfect_weeks as number,
    lifetimePickemWins: row.lifetime_pickem_wins as number,
    earningsCents: row.earnings_cents as number,
  };
}

export async function listPickemSeasonArchives(
  sport: PickemSport = "nfl"
): Promise<PickemSeasonArchive[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(ARCHIVE_TABLE)
    .select("*")
    .eq("sport", sport)
    .order("season_year", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapArchive(row as Record<string, unknown>));
}

export async function getPickemSeasonArchive(input: {
  sport: PickemSport;
  seasonYear: number;
}): Promise<PickemSeasonArchive | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(ARCHIVE_TABLE)
    .select("*")
    .eq("sport", input.sport)
    .eq("season_year", input.seasonYear)
    .maybeSingle();

  if (error) throw error;
  return data ? mapArchive(data as Record<string, unknown>) : null;
}

export async function getPickemSeasonStandings(
  archiveId: string,
  limit = TOP_N
): Promise<PickemSeasonStanding[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(STANDINGS_TABLE)
    .select("*")
    .eq("archive_id", archiveId)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapStanding(row as Record<string, unknown>));
}

/**
 * Archive a completed NFL season — champion + top 100 standings.
 * Idempotent per (sport, season_year).
 */
export async function archivePickemSeason(input: {
  sport: PickemSport;
  seasonYear: number;
  totalWeeks?: number;
}): Promise<{ archived: boolean; archiveId: string | null }> {
  const existing = await getPickemSeasonArchive({
    sport: input.sport,
    seasonYear: input.seasonYear,
  });
  if (existing) return { archived: false, archiveId: existing.id };

  const stats = await listPickemStatsForLeaderboard({
    sport: input.sport,
    seasonYear: input.seasonYear,
    limit: TOP_N,
  });

  if (!stats.length) return { archived: false, archiveId: null };

  const sorted = [...stats].sort((a, b) => {
    if (b.lifetimePickemWins !== a.lifetimePickemWins) {
      return b.lifetimePickemWins - a.lifetimePickemWins;
    }
    if (b.seasonWins !== a.seasonWins) return b.seasonWins - a.seasonWins;
    return b.pickAccuracyPct - a.pickAccuracyPct;
  });

  const champion = sorted[0];
  const supabase = getSupabaseAdmin();

  const { data: archiveRow, error: archiveError } = await supabase
    .from(ARCHIVE_TABLE)
    .insert({
      sport: input.sport,
      season_year: input.seasonYear,
      champion_email: champion.email,
      champion_display_name: maskPlayerLabel(champion.email),
      champion_record: `${champion.seasonWins}-${champion.seasonLosses}`,
      champion_accuracy_pct: champion.pickAccuracyPct,
      champion_longest_streak: champion.longestStreak,
      champion_perfect_weeks: champion.perfectWeeks,
      champion_earnings_cents: champion.lifetimeEarningsCents,
      total_players: stats.length,
      total_weeks: input.totalWeeks ?? champion.weeksPlayed,
    })
    .select("id")
    .single();

  if (archiveError?.code === "23505") {
    const raced = await getPickemSeasonArchive({
      sport: input.sport,
      seasonYear: input.seasonYear,
    });
    return { archived: false, archiveId: raced?.id ?? null };
  }
  if (archiveError) throw archiveError;

  const archiveId = archiveRow.id as string;
  const standingsRows = sorted.slice(0, TOP_N).map((row, index) => ({
    archive_id: archiveId,
    rank: index + 1,
    email: row.email,
    display_name: maskPlayerLabel(row.email),
    season_wins: row.seasonWins,
    season_losses: row.seasonLosses,
    pick_accuracy_pct: row.pickAccuracyPct,
    longest_streak: row.longestStreak,
    perfect_weeks: row.perfectWeeks,
    lifetime_pickem_wins: row.lifetimePickemWins,
    earnings_cents: row.lifetimeEarningsCents,
  }));

  const { error: standingsError } = await supabase
    .from(STANDINGS_TABLE)
    .insert(standingsRows);

  if (standingsError) throw standingsError;

  return { archived: true, archiveId };
}
