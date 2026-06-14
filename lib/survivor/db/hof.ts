import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { displayNameFromEmail, normalizeEmail } from "@/lib/player/statsCore";
import type { SurvivorHofCategory, SurvivorSport } from "@/lib/survivor/types";

const TABLE = "survivor_hof_entries";

export interface SurvivorHofEntry {
  id: string;
  email: string;
  displayName: string;
  sport: SurvivorSport;
  seasonYear: number;
  leagueId: string | null;
  category: SurvivorHofCategory;
  headline: string;
  detail: string | null;
  statValue: number | null;
  inductedAt: string;
}

interface HofRow {
  id: string;
  email: string;
  sport: string;
  season_year: number;
  league_id: string | null;
  category: SurvivorHofCategory;
  headline: string;
  detail: string | null;
  stat_value: number | null;
  inducted_at: string;
}

function mapRow(row: HofRow, displayName?: string): SurvivorHofEntry {
  return {
    id: row.id,
    email: row.email,
    displayName: displayName ?? displayNameFromEmail(row.email),
    sport: row.sport as SurvivorSport,
    seasonYear: row.season_year,
    leagueId: row.league_id,
    category: row.category,
    headline: row.headline,
    detail: row.detail,
    statValue: row.stat_value,
    inductedAt: row.inducted_at,
  };
}

async function resolveDisplayNames(emails: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (emails.length === 0) return map;

  const supabase = getSupabaseAdmin();
  const normalized = emails.map(normalizeEmail);

  const { data: entries } = await supabase
    .from("survivor_entries")
    .select("email, display_name")
    .in("email", normalized);

  for (const row of entries ?? []) {
    map.set(normalizeEmail(row.email as string), row.display_name as string);
  }

  for (const email of normalized) {
    if (!map.has(email)) map.set(email, displayNameFromEmail(email));
  }

  return map;
}

export async function inductSurvivorHofEntry(input: {
  email: string;
  sport?: SurvivorSport;
  seasonYear: number;
  leagueId?: string | null;
  category: SurvivorHofCategory;
  headline: string;
  detail?: string | null;
  statValue?: number | null;
}): Promise<SurvivorHofEntry | null> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);
  const sport = input.sport ?? "nfl";

  const { data: existing } = await supabase
    .from(TABLE)
    .select("id")
    .eq("email", email)
    .eq("sport", sport)
    .eq("season_year", input.seasonYear)
    .eq("category", input.category)
    .maybeSingle();

  if (existing?.id) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      email,
      sport,
      season_year: input.seasonYear,
      league_id: input.leagueId ?? null,
      category: input.category,
      headline: input.headline,
      detail: input.detail ?? null,
      stat_value: input.statValue ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  const names = await resolveDisplayNames([email]);
  return mapRow(data as HofRow, names.get(email));
}

export interface SurvivorCareerLeader {
  email: string;
  displayName: string;
  value: number;
  label: string;
}

export interface SurvivorHallOfFameView {
  seasonYear: number;
  byCategory: Partial<Record<SurvivorHofCategory, SurvivorHofEntry[]>>;
  seasonLeaders: SurvivorCareerLeader[];
  activeSeason: {
    playersRemaining: number;
    totalEntries: number;
    shieldsUsed: number;
  };
}

export async function buildSurvivorHallOfFameView(
  seasonYear = new Date().getFullYear()
): Promise<SurvivorHallOfFameView> {
  const supabase = getSupabaseAdmin();

  const { data: hofRows, error: hofError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("sport", "nfl")
    .order("inducted_at", { ascending: false })
    .limit(100);

  if (hofError) throw hofError;

  const rows = (hofRows ?? []) as HofRow[];
  const emails = Array.from(new Set(rows.map((r) => r.email)));
  const names = await resolveDisplayNames(emails);

  const byCategory: Partial<Record<SurvivorHofCategory, SurvivorHofEntry[]>> = {};
  for (const row of rows) {
    const entry = mapRow(row, names.get(normalizeEmail(row.email)));
    const list = byCategory[row.category] ?? [];
    list.push(entry);
    byCategory[row.category] = list;
  }

  const { data: league } = await supabase
    .from("survivor_leagues")
    .select("id")
    .eq("sport", "nfl")
    .eq("season_year", seasonYear)
    .eq("mode", "global")
    .maybeSingle();

  let seasonLeaders: SurvivorCareerLeader[] = [];
  let playersRemaining = 0;
  let totalEntries = 0;
  let shieldsUsed = 0;

  if (league?.id) {
    const { data: entries } = await supabase
      .from("survivor_entries")
      .select("email, display_name, weeks_survived, status, shield_used_week")
      .eq("league_id", league.id)
      .order("weeks_survived", { ascending: false })
      .limit(10);

    totalEntries = entries?.length ?? 0;
    playersRemaining =
      entries?.filter((e) => e.status === "active").length ?? 0;
    shieldsUsed =
      entries?.filter((e) => e.shield_used_week != null).length ?? 0;

    seasonLeaders = (entries ?? []).slice(0, 5).map((e) => ({
      email: e.email as string,
      displayName: (e.display_name as string) || displayNameFromEmail(e.email as string),
      value: e.weeks_survived as number,
      label: "weeks survived",
    }));
  }

  const { data: careerRows } = await supabase
    .from("survivor_career_stats")
    .select("email, longest_survival_streak, shield_saves_lifetime, championships")
    .eq("sport", "nfl")
    .order("longest_survival_streak", { ascending: false })
    .limit(5);

  const careerEmails = (careerRows ?? []).map((r) => r.email as string);
  const careerNames = await resolveDisplayNames(careerEmails);

  for (const row of careerRows ?? []) {
    const email = row.email as string;
    if ((row.shield_saves_lifetime as number) > 0) {
      seasonLeaders.push({
        email,
        displayName: careerNames.get(normalizeEmail(email)) ?? displayNameFromEmail(email),
        value: row.shield_saves_lifetime as number,
        label: "lifetime shield saves",
      });
    }
  }

  return {
    seasonYear,
    byCategory,
    seasonLeaders,
    activeSeason: {
      playersRemaining,
      totalEntries,
      shieldsUsed,
    },
  };
}
