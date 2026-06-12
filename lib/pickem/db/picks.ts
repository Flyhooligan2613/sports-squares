import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { displayNameFromEmail, normalizeEmail } from "@/lib/player/statsCore";
import type { PickemPick, PickemSide } from "@/lib/pickem/types";
import { getPickemGameById } from "@/lib/pickem/db/gamesLookup";

const TABLE = "pickem_picks";

interface PickRow {
  id: string;
  contest_id: string;
  game_id: string;
  email: string;
  picked_side: PickemSide;
  is_correct: boolean | null;
  locked_at: string | null;
}

function mapPick(row: PickRow): PickemPick {
  return {
    id: row.id,
    contestId: row.contest_id,
    gameId: row.game_id,
    email: row.email,
    pickedSide: row.picked_side,
    isCorrect: row.is_correct,
    lockedAt: row.locked_at,
  };
}

export async function listUserPicksForContest(
  contestId: string,
  email: string
): Promise<PickemPick[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("contest_id", contestId)
    .eq("email", normalizeEmail(email));

  if (error) throw error;
  return (data as PickRow[]).map(mapPick);
}

export async function savePickemPick(input: {
  contestId: string;
  gameId: string;
  email: string;
  pickedSide: PickemSide;
}): Promise<PickemPick> {
  const email = normalizeEmail(input.email);
  const game = await getPickemGameById(input.gameId);

  if (!game || game.contestId !== input.contestId) {
    throw new Error("Game not found for this contest.");
  }

  if (game.picksLocked || new Date(game.kickoffAt).getTime() <= Date.now()) {
    throw new Error("Picks are locked for this game.");
  }

  await ensurePlayerProfile(email, displayNameFromEmail(email));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        contest_id: input.contestId,
        game_id: input.gameId,
        email,
        picked_side: input.pickedSide,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email,game_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapPick(data as PickRow);
}

export async function lockPicksForGame(gameId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from(TABLE)
    .update({ locked_at: now, updated_at: now })
    .eq("game_id", gameId)
    .is("locked_at", null);

  if (error) throw error;
}

export async function gradePicksForGame(input: {
  gameId: string;
  winnerSide: "away" | "home" | "tie" | null;
}): Promise<number> {
  if (!input.winnerSide || input.winnerSide === "tie") {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(TABLE)
      .update({ is_correct: null, updated_at: new Date().toISOString() })
      .eq("game_id", input.gameId);
    if (error) throw error;
    return 0;
  }

  const supabase = getSupabaseAdmin();
  const { data: picks, error } = await supabase
    .from(TABLE)
    .select("id, picked_side")
    .eq("game_id", input.gameId);

  if (error) throw error;

  let graded = 0;
  for (const pick of picks ?? []) {
    const isCorrect = pick.picked_side === input.winnerSide;
    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        is_correct: isCorrect,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pick.id);

    if (updateError) throw updateError;
    graded += 1;
  }

  return graded;
}
