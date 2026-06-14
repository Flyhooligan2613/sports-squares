import type { PoolHighlightSquare } from "@/lib/highlight/types";
import type { ScoringPeriod } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface HighlightRow {
  square_number: number;
  reward_credits: number;
  activated_at: string | null;
  activated_period: string | null;
}

export async function loadPoolHighlights(
  poolId: string
): Promise<PoolHighlightSquare[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pool_highlight_squares")
    .select("square_number, reward_credits, activated_at, activated_period")
    .eq("pool_id", poolId)
    .order("square_number");

  if (error) throw error;

  return ((data ?? []) as HighlightRow[]).map((row) => ({
    squareNumber: row.square_number,
    rewardCredits: row.reward_credits,
    activatedAt: row.activated_at,
    activatedPeriod: (row.activated_period as ScoringPeriod | null) ?? null,
  }));
}
