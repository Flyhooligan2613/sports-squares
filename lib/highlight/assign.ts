import { randomBytes } from "crypto";
import { TABLES } from "@/lib/database/config";
import {
  HIGHLIGHT_REWARD_CREDITS,
  HIGHLIGHT_SQUARE_COUNT,
} from "@/lib/highlight/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function shufflePick<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** Assign Highlight Squares™ to random occupied squares after numbers are drawn. Idempotent. */
export async function assignHighlightSquaresForPool(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count: existing, error: countError } = await supabase
    .from("pool_highlight_squares")
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId);

  if (countError) throw countError;
  if ((existing ?? 0) > 0) return 0;

  const { data: claimed, error } = await supabase
    .from(TABLES.squares)
    .select("square_number")
    .eq("pool_id", poolId)
    .eq("claimed", true);

  if (error) throw error;
  if (!claimed?.length) return 0;

  const seed = randomBytes(8).toString("hex");
  const picks = shufflePick(claimed, HIGHLIGHT_SQUARE_COUNT);

  const rows = picks.map((sq) => ({
    pool_id: poolId,
    square_number: sq.square_number,
    assignment_seed: seed,
    reward_credits: HIGHLIGHT_REWARD_CREDITS,
  }));

  const { error: insertError } = await supabase
    .from("pool_highlight_squares")
    .insert(rows);

  if (insertError) throw insertError;
  return rows.length;
}
