import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TournamentMatchupStatus } from "@/lib/tournamentRoyale/types";

export interface TournamentMatchupRow {
  id: string;
  event_id: string;
  round_id: string;
  slot_index: number;
  region: string | null;
  top_team_name: string;
  top_team_seed: number;
  bottom_team_name: string;
  bottom_team_seed: number;
  winner_team_name: string | null;
  status: TournamentMatchupStatus;
  top_score: number | null;
  bottom_score: number | null;
  advances_to_matchup_id: string | null;
}

export async function listMatchupsForRound(roundId: string): Promise<TournamentMatchupRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_matchups")
    .select("*")
    .eq("round_id", roundId)
    .order("slot_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TournamentMatchupRow[];
}

export async function listMatchupsForEvent(eventId: string): Promise<TournamentMatchupRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_matchups")
    .select("*")
    .eq("event_id", eventId)
    .order("round_id")
    .order("slot_index");

  if (error) throw error;
  return (data ?? []) as TournamentMatchupRow[];
}

export async function getMatchupById(id: string): Promise<TournamentMatchupRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_matchups")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as TournamentMatchupRow | null;
}
