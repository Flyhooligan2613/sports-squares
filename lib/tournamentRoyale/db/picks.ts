import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface TournamentPickRow {
  id: string;
  entry_id: string;
  matchup_id: string;
  picked_team_name: string;
  points_earned: number;
  cinderella_points: number;
  is_correct: boolean | null;
  is_upset: boolean;
  shield_applied: boolean;
}

export async function listPicksForEntry(entryId: string): Promise<TournamentPickRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_picks")
    .select("*")
    .eq("entry_id", entryId);

  if (error) throw error;
  return (data ?? []) as TournamentPickRow[];
}

export async function upsertPick(input: {
  entryId: string;
  matchupId: string;
  pickedTeamName: string;
}): Promise<TournamentPickRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_picks")
    .upsert(
      {
        entry_id: input.entryId,
        matchup_id: input.matchupId,
        picked_team_name: input.pickedTeamName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "entry_id,matchup_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as TournamentPickRow;
}

export async function updateEntryCompletion(
  entryId: string,
  completionPct: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("tournament_royale_entries")
    .update({ bracket_completion_pct: completionPct, updated_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) throw error;
}
