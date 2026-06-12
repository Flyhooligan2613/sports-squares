import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  computePickemAchievements,
  emptyPickemPlayerStats,
  pickAccuracyPct,
} from "@/lib/pickem/achievements";
import type { PickemPlayerStats, PickemSport } from "@/lib/pickem/types";

const TABLE = "pickem_player_stats";

interface StatsRow {
  email: string;
  sport: PickemSport;
  season_year: number;
  weekly_wins: number;
  weekly_losses: number;
  weekly_pending: number;
  season_wins: number;
  season_losses: number;
  lifetime_wins: number;
  lifetime_losses: number;
  current_streak: number;
  longest_streak: number;
  perfect_week_streak: number;
  weekly_win_streak: number;
  weeks_played: number;
  perfect_weeks: number;
  season_championships: number;
  total_picks: number;
  correct_picks: number;
  achievements: PickemPlayerStats["achievements"] | null;
}

function mapStats(row: StatsRow): PickemPlayerStats {
  const stats: PickemPlayerStats = {
    email: row.email,
    sport: row.sport,
    seasonYear: row.season_year,
    weeklyWins: row.weekly_wins,
    weeklyLosses: row.weekly_losses,
    weeklyPending: row.weekly_pending,
    seasonWins: row.season_wins,
    seasonLosses: row.season_losses,
    lifetimeWins: row.lifetime_wins,
    lifetimeLosses: row.lifetime_losses,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    perfectWeekStreak: row.perfect_week_streak,
    weeklyWinStreak: row.weekly_win_streak,
    weeksPlayed: row.weeks_played,
    perfectWeeks: row.perfect_weeks,
    seasonChampionships: row.season_championships,
    totalPicks: row.total_picks,
    correctPicks: row.correct_picks,
    pickAccuracyPct: pickAccuracyPct(row.correct_picks, row.total_picks),
    achievements: row.achievements ?? [],
  };

  stats.achievements = computePickemAchievements(stats);
  return stats;
}

export async function getPickemPlayerStats(
  email: string,
  sport: PickemSport,
  seasonYear: number
): Promise<PickemPlayerStats> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("sport", sport)
    .eq("season_year", seasonYear)
    .maybeSingle();

  if (error) throw error;
  if (!data) return emptyPickemPlayerStats(normalizeEmail(email), sport, seasonYear);
  return mapStats(data as StatsRow);
}

export async function upsertPickemPlayerStats(
  stats: PickemPlayerStats
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const achievements = computePickemAchievements(stats);

  const { error } = await supabase.from(TABLE).upsert(
    {
      email: normalizeEmail(stats.email),
      sport: stats.sport,
      season_year: stats.seasonYear,
      weekly_wins: stats.weeklyWins,
      weekly_losses: stats.weeklyLosses,
      weekly_pending: stats.weeklyPending,
      season_wins: stats.seasonWins,
      season_losses: stats.seasonLosses,
      lifetime_wins: stats.lifetimeWins,
      lifetime_losses: stats.lifetimeLosses,
      current_streak: stats.currentStreak,
      longest_streak: stats.longestStreak,
      perfect_week_streak: stats.perfectWeekStreak,
      weekly_win_streak: stats.weeklyWinStreak,
      weeks_played: stats.weeksPlayed,
      perfect_weeks: stats.perfectWeeks,
      season_championships: stats.seasonChampionships,
      total_picks: stats.totalPicks,
      correct_picks: stats.correctPicks,
      achievements,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,sport,season_year" }
  );

  if (error) throw error;
}

export async function listPickemStatsForLeaderboard(input: {
  sport: PickemSport;
  seasonYear: number;
  limit?: number;
}): Promise<PickemPlayerStats[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", input.sport)
    .eq("season_year", input.seasonYear)
    .order("correct_picks", { ascending: false })
    .limit(input.limit ?? 100);

  if (error) throw error;
  return (data as StatsRow[]).map(mapStats);
}

export async function recomputeWeeklyStatsForPlayer(input: {
  email: string;
  sport: PickemSport;
  seasonYear: number;
  contestId: string;
}): Promise<PickemPlayerStats> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);

  const { data: picks, error: picksError } = await supabase
    .from("pickem_picks")
    .select("is_correct")
    .eq("contest_id", input.contestId)
    .eq("email", email);

  if (picksError) throw picksError;

  let weeklyWins = 0;
  let weeklyLosses = 0;
  let weeklyPending = 0;

  for (const pick of picks ?? []) {
    if (pick.is_correct === true) weeklyWins += 1;
    else if (pick.is_correct === false) weeklyLosses += 1;
    else weeklyPending += 1;
  }

  const base = await getPickemPlayerStats(email, input.sport, input.seasonYear);

  let currentStreak = base.currentStreak;
  let longestStreak = base.longestStreak;

  for (const pick of picks ?? []) {
    if (pick.is_correct === true) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (pick.is_correct === false) {
      currentStreak = 0;
    }
  }

  const gradedTotal = weeklyWins + weeklyLosses;
  const newTotalPicks = base.totalPicks + gradedTotal;
  const newCorrectPicks = base.correctPicks + weeklyWins;

  const updated: PickemPlayerStats = {
    ...base,
    weeklyWins,
    weeklyLosses,
    weeklyPending,
    currentStreak,
    longestStreak,
    seasonWins: base.seasonWins + weeklyWins,
    seasonLosses: base.seasonLosses + weeklyLosses,
    lifetimeWins: base.lifetimeWins + weeklyWins,
    lifetimeLosses: base.lifetimeLosses + weeklyLosses,
    totalPicks: newTotalPicks,
    correctPicks: newCorrectPicks,
    weeksPlayed: base.weeksPlayed + 1,
    perfectWeeks:
      base.perfectWeeks +
      (weeklyLosses === 0 && weeklyWins > 0 && weeklyPending === 0 ? 1 : 0),
    pickAccuracyPct: pickAccuracyPct(newCorrectPicks, newTotalPicks),
  };

  await upsertPickemPlayerStats(updated);
  return updated;
}
