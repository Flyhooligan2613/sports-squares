import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type { SurvivorSport } from "@/lib/survivor/types";

const TABLE = "survivor_career_stats";

export type SurvivorShieldBadge =
  | "guardian"
  | "last_stand"
  | "untouchable"
  | "second_chance"
  | "iron_will";

interface CareerRow {
  email: string;
  sport: string;
  seasons_played: number;
  championships: number;
  longest_survival_streak: number;
  current_survival_streak: number;
  perfect_seasons: number;
  total_weeks_survived: number;
  lifetime_eliminations: number;
  hof_score: number;
  shield_saves_lifetime: number;
  seasons_without_shield: number;
  perfect_seasons_without_shield: number;
  badges: SurvivorShieldBadge[] | unknown;
}

async function ensureCareerRow(email: string, sport: SurvivorSport = "nfl"): Promise<CareerRow> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", normalized)
    .eq("sport", sport)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing as CareerRow;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ email: normalized, sport })
    .select("*")
    .single();

  if (error) throw error;
  return data as CareerRow;
}

function parseBadges(raw: unknown): SurvivorShieldBadge[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((b): b is SurvivorShieldBadge => typeof b === "string");
}

async function appendBadge(
  email: string,
  badge: SurvivorShieldBadge,
  sport: SurvivorSport = "nfl"
): Promise<void> {
  const row = await ensureCareerRow(email, sport);
  const badges = parseBadges(row.badges);
  if (badges.includes(badge)) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      badges: [...badges, badge],
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(email))
    .eq("sport", sport);

  if (error) throw error;
}

/** LegacyCore™ — record a shield save and award Guardian on first use. */
export async function recordShieldSaveLegacy(input: {
  email: string;
  sport?: SurvivorSport;
}): Promise<void> {
  const sport = input.sport ?? "nfl";
  const row = await ensureCareerRow(input.email, sport);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from(TABLE)
    .update({
      shield_saves_lifetime: row.shield_saves_lifetime + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(input.email))
    .eq("sport", sport);

  if (error) throw error;
  await appendBadge(input.email, "guardian", sport);
}

/** LegacyCore — increment streaks when a week is survived. */
export async function recordSurvivorWeekSurvivedLegacy(input: {
  email: string;
  sport?: SurvivorSport;
}): Promise<void> {
  const sport = input.sport ?? "nfl";
  const row = await ensureCareerRow(input.email, sport);
  const streak = row.current_survival_streak + 1;
  const longest = Math.max(row.longest_survival_streak, streak);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      current_survival_streak: streak,
      longest_survival_streak: longest,
      total_weeks_survived: row.total_weeks_survived + 1,
      hof_score: row.hof_score + 10,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(input.email))
    .eq("sport", sport);

  if (error) throw error;
}

/** LegacyCore — record elimination and reset streak. */
export async function recordSurvivorEliminatedLegacy(input: {
  email: string;
  sport?: SurvivorSport;
}): Promise<void> {
  const sport = input.sport ?? "nfl";
  const row = await ensureCareerRow(input.email, sport);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from(TABLE)
    .update({
      current_survival_streak: 0,
      lifetime_eliminations: row.lifetime_eliminations + 1,
      seasons_played: row.seasons_played + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(input.email))
    .eq("sport", sport);

  if (error) throw error;
}

/** LegacyCore — champion crowned with HOF induction. */
export async function recordSurvivorChampionLegacy(input: {
  email: string;
  displayName: string;
  seasonYear: number;
  leagueId: string;
  weeksSurvived: number;
  shieldWasUsed: boolean;
  sport?: SurvivorSport;
}): Promise<void> {
  const sport = input.sport ?? "nfl";
  await recordChampionShieldLegacy({
    email: input.email,
    shieldWasUsed: input.shieldWasUsed,
    sport,
  });

  const row = await ensureCareerRow(input.email, sport);
  const supabase = getSupabaseAdmin();
  const perfect = !input.shieldWasUsed;

  const { error } = await supabase
    .from(TABLE)
    .update({
      championships: row.championships + 1,
      seasons_played: row.seasons_played + 1,
      perfect_seasons: perfect ? row.perfect_seasons + 1 : row.perfect_seasons,
      hof_score: row.hof_score + 200,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalizeEmail(input.email))
    .eq("sport", sport);

  if (error) throw error;

  const { inductSurvivorHofEntry } = await import("@/lib/survivor/db/hof");
  await inductSurvivorHofEntry({
    email: input.email,
    sport,
    seasonYear: input.seasonYear,
    leagueId: input.leagueId,
    category: "champion",
    headline: `${input.displayName} — Survivor X champion`,
    detail: `${input.weeksSurvived} weeks survived in ${input.seasonYear}.`,
    statValue: input.weeksSurvived,
  });

  if (perfect) {
    await inductSurvivorHofEntry({
      email: input.email,
      sport,
      seasonYear: input.seasonYear,
      leagueId: input.leagueId,
      category: "untouchable",
      headline: `${input.displayName} — Untouchable`,
      detail: "Won without using a Survivor Shield.",
      statValue: input.weeksSurvived,
    });
  }

  if (input.weeksSurvived >= 5) {
    await inductSurvivorHofEntry({
      email: input.email,
      sport,
      seasonYear: input.seasonYear,
      leagueId: input.leagueId,
      category: "longest_streak",
      headline: `${input.displayName} — ${input.weeksSurvived} week run`,
      statValue: input.weeksSurvived,
    });
  }
}

/** LegacyCore™ — champion achievements tied to shield usage. */
export async function recordChampionShieldLegacy(input: {
  email: string;
  shieldWasUsed: boolean;
  sport?: SurvivorSport;
}): Promise<void> {
  const sport = input.sport ?? "nfl";
  const row = await ensureCareerRow(input.email, sport);
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (input.shieldWasUsed) {
    await appendBadge(input.email, "last_stand", sport);
  } else {
    const { error } = await supabase
      .from(TABLE)
      .update({
        seasons_without_shield: row.seasons_without_shield + 1,
        perfect_seasons_without_shield: row.perfect_seasons_without_shield + 1,
        updated_at: now,
      })
      .eq("email", normalizeEmail(input.email))
      .eq("sport", sport);

    if (error) throw error;
    await appendBadge(input.email, "untouchable", sport);
  }
}
