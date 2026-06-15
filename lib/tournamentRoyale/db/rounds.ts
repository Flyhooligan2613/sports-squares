import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TournamentRoundStatus } from "@/lib/tournamentRoyale/types";

export interface TournamentRoundRow {
  id: string;
  event_id: string;
  round_number: number;
  label: string;
  status: TournamentRoundStatus;
  locks_at: string | null;
}

export async function listRoundsForEvent(eventId: string): Promise<TournamentRoundRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_rounds")
    .select("*")
    .eq("event_id", eventId)
    .order("round_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TournamentRoundRow[];
}

export async function getCurrentRound(
  eventId: string,
  roundNumber: number
): Promise<TournamentRoundRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_rounds")
    .select("*")
    .eq("event_id", eventId)
    .eq("round_number", roundNumber)
    .maybeSingle();

  if (error) throw error;
  return data as TournamentRoundRow | null;
}
