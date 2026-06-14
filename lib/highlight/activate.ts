import { publishPlatformEvent } from "@/lib/events/engine";
import { HIGHLIGHT_REWARD_CREDITS } from "@/lib/highlight/config";
import { earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ScoringPeriod } from "@/lib/types";

interface HighlightRow {
  id: string;
  activated_at: string | null;
  reward_credits: number;
}

/** When a checkpoint winner lands on a highlight square, activate it and award bonus credits. */
export async function tryActivateHighlightForWin(input: {
  poolId: string;
  squareId: number;
  period: ScoringPeriod;
  ownerName: string;
  ownerEmail?: string | null;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from("pool_highlight_squares")
    .select("id, activated_at, reward_credits")
    .eq("pool_id", input.poolId)
    .eq("square_number", input.squareId)
    .maybeSingle();

  if (error || !row) return false;

  const highlight = row as HighlightRow;
  if (highlight.activated_at) return false;

  const now = new Date().toISOString();
  const rewardCredits = highlight.reward_credits ?? HIGHLIGHT_REWARD_CREDITS;

  await supabase
    .from("pool_highlight_squares")
    .update({
      activated_at: now,
      activated_period: input.period,
      owner_email: input.ownerEmail?.trim().toLowerCase() ?? null,
    })
    .eq("id", highlight.id);

  if (input.ownerEmail?.trim()) {
    await earnTierCredits({
      email: input.ownerEmail,
      amount: rewardCredits,
      source: "highlight_square",
      gameType: "squareboards",
      metadata: {
        poolId: input.poolId,
        squareNumber: input.squareId,
        period: input.period,
      },
    });
  }

  await publishPlatformEvent({
    type: "highlight.activated",
    priority: "high",
    summary: `Highlight Square™ activated — ${input.ownerName} (${input.period})`,
    gameType: "squareboards",
    entityType: "pool",
    entityId: input.poolId,
    payload: {
      squareNumber: input.squareId,
      period: input.period,
      ownerName: input.ownerName,
      rewardCredits,
    },
    idempotencyKey: `${input.poolId}:highlight:${input.squareId}:${input.period}`,
  });

  return true;
}
