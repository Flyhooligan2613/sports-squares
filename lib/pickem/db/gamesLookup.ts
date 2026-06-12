import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PickemGame } from "@/lib/pickem/types";
import { mapPickemGame } from "@/lib/pickem/db/games";

interface GameRow {
  id: string;
  contest_id: string;
  espn_game_id: string;
  away_team: string;
  home_team: string;
  away_abbr: string | null;
  home_abbr: string | null;
  away_record: string | null;
  home_record: string | null;
  away_logo_url: string | null;
  home_logo_url: string | null;
  kickoff_at: string;
  status: PickemGame["status"];
  winner_side: string | null;
  away_score: number | null;
  home_score: number | null;
  picks_locked: boolean;
  is_monday_night?: boolean;
}

export async function getPickemGameById(gameId: string): Promise<PickemGame | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pickem_games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPickemGame(data as GameRow) : null;
}
