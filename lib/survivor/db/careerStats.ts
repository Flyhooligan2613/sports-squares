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
    .select("email, sport, shield_saves_lifetime, seasons_without_shield, perfect_seasons_without_shield, badges")
    .eq("email", normalized)
    .eq("sport", sport)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing as CareerRow;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ email: normalized, sport })
    .select("email, sport, shield_saves_lifetime, seasons_without_shield, perfect_seasons_without_shield, badges")
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
