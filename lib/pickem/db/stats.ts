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

  const streakFromPicks = computeStreakFromPickResults(
    (picks ?? []).map((p) => p.is_correct as boolean | null)
  );

  const gradedTotal = weeklyWins + weeklyLosses;
  const newTotalPicks = base.totalPicks + gradedTotal;
  const newCorrectPicks = base.correctPicks + weeklyWins;

  const isPerfectWeek =
    weeklyLosses === 0 && weeklyWins > 0 && weeklyPending === 0;

  const updated: PickemPlayerStats = {
    ...base,
    weeklyWins,
    weeklyLosses,
    weeklyPending,
    currentStreak: streakFromPicks.current,
    longestStreak: Math.max(base.longestStreak, streakFromPicks.longest),
    perfectWeekStreak: isPerfectWeek
      ? base.perfectWeekStreak + 1
      : weeklyLosses > 0
        ? 0
        : base.perfectWeekStreak,
    weeklyWinStreak: weeklyWins > weeklyLosses ? base.weeklyWinStreak + 1 : 0,
    seasonWins: base.seasonWins + weeklyWins,
    seasonLosses: base.seasonLosses + weeklyLosses,
    lifetimeWins: base.lifetimeWins + weeklyWins,
    lifetimeLosses: base.lifetimeLosses + weeklyLosses,
    totalPicks: newTotalPicks,
    correctPicks: newCorrectPicks,
    weeksPlayed: base.weeksPlayed + 1,
    perfectWeeks: base.perfectWeeks + (isPerfectWeek ? 1 : 0),
    pickAccuracyPct: pickAccuracyPct(newCorrectPicks, newTotalPicks),
  };

  await upsertPickemPlayerStats(updated);
  return updated;
}

function computeStreakFromPickResults(results: Array<boolean | null>): {
  current: number;
  longest: number;
} {
  let current = 0;
  let longest = 0;

  for (const result of results) {
    if (result === true) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (result === false) {
      current = 0;
    }
  }

  return { current, longest };
}

export interface PickemWeeklyStanding {
  email: string;
  wins: number;
  losses: number;
  pending: number;
  accuracyPct: number;
}

export async function getContestWeeklyStandings(input: {
  contestId: string;
  leagueId?: string | null;
}): Promise<PickemWeeklyStanding[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("pickem_picks")
    .select("email, is_correct")
    .eq("contest_id", input.contestId);

  if (input.leagueId) {
    query = query.eq("league_id", input.leagueId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const byEmail = new Map<string, PickemWeeklyStanding>();

  for (const row of data ?? []) {
    const email = row.email as string;
    const entry = byEmail.get(email) ?? {
      email,
      wins: 0,
      losses: 0,
      pending: 0,
      accuracyPct: 0,
    };

    if (row.is_correct === true) entry.wins += 1;
    else if (row.is_correct === false) entry.losses += 1;
    else entry.pending += 1;

    byEmail.set(email, entry);
  }

  const standings = Array.from(byEmail.values()).map((s) => {
    const graded = s.wins + s.losses;
    return {
      ...s,
      accuracyPct: graded > 0 ? Math.round((s.wins / graded) * 1000) / 10 : 0,
    };
  });

  return standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    return a.losses - b.losses;
  });
}

export async function getWeeklyRankForPlayer(input: {
  contestId: string;
  email: string;
  leagueId?: string | null;
}): Promise<number | null> {
  const standings = await getContestWeeklyStandings({
    contestId: input.contestId,
    leagueId: input.leagueId,
  });

  const idx = standings.findIndex(
    (s) => s.email.toLowerCase() === normalizeEmail(input.email)
  );
  return idx >= 0 ? idx + 1 : null;
}

export async function getSeasonRankForPlayer(input: {
  sport: PickemSport;
  seasonYear: number;
  email: string;
}): Promise<number | null> {
  const stats = await listPickemStatsForLeaderboard({
    sport: input.sport,
    seasonYear: input.seasonYear,
    limit: 5000,
  });

  const sorted = [...stats].sort((a, b) => {
    if (b.seasonWins !== a.seasonWins) return b.seasonWins - a.seasonWins;
    return b.pickAccuracyPct - a.pickAccuracyPct;
  });

  const idx = sorted.findIndex(
    (s) => s.email.toLowerCase() === normalizeEmail(input.email)
  );
  return idx >= 0 ? idx + 1 : null;
}

export async function refreshContestWeeklySnapshots(
  contestId: string,
  leagueId?: string | null
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const standings = await getContestWeeklyStandings({ contestId, leagueId });

  for (let i = 0; i < standings.length; i += 1) {
    const row = standings[i];
    const { error } = await supabase.from("pickem_weekly_snapshots").upsert(
      {
        contest_id: contestId,
        league_id: leagueId ?? null,
        email: normalizeEmail(row.email),
        wins: row.wins,
        losses: row.losses,
        pending: row.pending,
        rank: i + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "contest_id,league_id,email" }
    );

    if (error) throw error;
  }
}

export async function recomputeLiveWeeklyStatsForPlayer(input: {
  email: string;
  sport: PickemSport;
  seasonYear: number;
  contestId: string;
}): Promise<PickemPlayerStats> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);

  const { data: picks, error } = await supabase
    .from("pickem_picks")
    .select("is_correct")
    .eq("contest_id", input.contestId)
    .eq("email", email);

  if (error) throw error;

  let weeklyWins = 0;
  let weeklyLosses = 0;
  let weeklyPending = 0;

  for (const pick of picks ?? []) {
    if (pick.is_correct === true) weeklyWins += 1;
    else if (pick.is_correct === false) weeklyLosses += 1;
    else weeklyPending += 1;
  }

  const base = await getPickemPlayerStats(email, input.sport, input.seasonYear);
  const streak = computeStreakFromPickResults(
    (picks ?? []).map((p) => p.is_correct as boolean | null)
  );

  const updated: PickemPlayerStats = {
    ...base,
    weeklyWins,
    weeklyLosses,
    weeklyPending,
    currentStreak: streak.current,
    longestStreak: Math.max(base.longestStreak, streak.longest),
    pickAccuracyPct: pickAccuracyPct(
      base.correctPicks + weeklyWins,
      base.totalPicks + weeklyWins + weeklyLosses
    ),
  };

  await upsertPickemPlayerStats(updated);
  return updated;
}
