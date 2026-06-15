import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TournamentEventStatus, TournamentKey, TournamentSport } from "@/lib/tournamentRoyale/types";

export interface TournamentEventRow {
  id: string;
  tournament_key: TournamentKey;
  sport: TournamentSport;
  season_year: number;
  name: string;
  description: string | null;
  status: TournamentEventStatus;
  current_round_number: number;
  champion_team: string | null;
  locks_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

export async function getActiveTournamentEvent(
  tournamentKey: TournamentKey
): Promise<TournamentEventRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_events")
    .select("*")
    .eq("tournament_key", tournamentKey)
    .in("status", ["open", "active"])
    .order("season_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as TournamentEventRow | null;
}

export async function getTournamentEventById(id: string): Promise<TournamentEventRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as TournamentEventRow | null;
}
