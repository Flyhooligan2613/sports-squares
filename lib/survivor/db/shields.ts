import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { SURVIVOR_SHIELD_DESIGN_DEFAULT } from "@/lib/survivor/config";

const USES_TABLE = "survivor_shield_uses";

export interface SurvivorShieldUse {
  id: string;
  entryId: string;
  leagueId: string;
  weekId: string | null;
  pickId: string | null;
  email: string;
  weekNumber: number;
  teamAbbr: string | null;
  teamName: string | null;
  shieldDesign: string;
  consumedAt: string;
}

export async function recordShieldUse(input: {
  entryId: string;
  leagueId: string;
  weekId: string;
  pickId: string;
  email: string;
  weekNumber: number;
  teamAbbr: string;
  teamName: string;
  shieldDesign?: string;
}): Promise<SurvivorShieldUse> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(USES_TABLE)
    .insert({
      entry_id: input.entryId,
      league_id: input.leagueId,
      week_id: input.weekId,
      pick_id: input.pickId,
      email: normalizeEmail(input.email),
      week_number: input.weekNumber,
      team_abbr: input.teamAbbr.toUpperCase(),
      team_name: input.teamName,
      shield_design: input.shieldDesign ?? SURVIVOR_SHIELD_DESIGN_DEFAULT,
    })
    .select("*")
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    entryId: row.entry_id as string,
    leagueId: row.league_id as string,
    weekId: (row.week_id as string) ?? null,
    pickId: (row.pick_id as string) ?? null,
    email: row.email as string,
    weekNumber: row.week_number as number,
    teamAbbr: (row.team_abbr as string) ?? null,
    teamName: (row.team_name as string) ?? null,
    shieldDesign: row.shield_design as string,
    consumedAt: row.consumed_at as string,
  };
}

export async function countShieldUsesForWeek(
  leagueId: string,
  weekNumber: number
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(USES_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("league_id", leagueId)
    .eq("week_number", weekNumber);

  if (error) throw error;
  return count ?? 0;
}
