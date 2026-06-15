import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface TournamentPoolRow {
  id: string;
  event_id: string;
  name: string;
  visibility: string;
  entry_count: number;
}

export async function getGlobalPoolForEvent(eventId: string): Promise<TournamentPoolRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tournament_royale_pools")
    .select("*")
    .eq("event_id", eventId)
    .eq("visibility", "global")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as TournamentPoolRow | null;
}
