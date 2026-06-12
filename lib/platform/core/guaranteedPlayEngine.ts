import { GUARANTEED_FILL_SQUARES, PLATFORM_SQUARE_OWNER_LABEL } from "@/lib/platform/core/guaranteedPlay";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";
import { creditGrowthFund } from "@/lib/platform/core/growthFund";
import {
  dbCountClaimedSquares,
  dbCreateMarketplaceBoard,
  dbLockAndDrawBoard,
} from "@/lib/database/services/boards";
import { dbGetGame } from "@/lib/database/services/games";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface GuaranteedFillResult {
  triggered: boolean;
  squaresFilled: number;
  boardLocked: boolean;
}

/** Fill remaining squares with platform-owned entries when threshold is reached. */
export async function maybeCompleteGuaranteedBoard(
  poolId: string
): Promise<GuaranteedFillResult> {
  const supabase = getSupabaseAdmin();

  const { data: pool, error } = await supabase
    .from(TABLES.pools)
    .select("id, status, guaranteed_fill_at, kickoff_at, game_id, board_index, entry_tier_cents")
    .eq("id", poolId)
    .maybeSingle();

  if (error || !pool || pool.status !== "open" || pool.guaranteed_fill_at) {
    return { triggered: false, squaresFilled: 0, boardLocked: false };
  }

  if (pool.kickoff_at && new Date(pool.kickoff_at as string).getTime() <= Date.now()) {
    return { triggered: false, squaresFilled: 0, boardLocked: false };
  }

  const claimed = await dbCountClaimedSquares(poolId);
  if (claimed < GUARANTEED_FILL_SQUARES) {
    return { triggered: false, squaresFilled: 0, boardLocked: false };
  }

  const { data: unclaimed, error: unclaimedError } = await supabase
    .from(TABLES.squares)
    .select("square_number")
    .eq("pool_id", poolId)
    .eq("claimed", false);

  if (unclaimedError) throw unclaimedError;

  const now = new Date().toISOString();
  let filled = 0;

  for (const row of unclaimed ?? []) {
    const { error: updateError } = await supabase
      .from(TABLES.squares)
      .update({
        claimed: true,
        platform_owned: true,
        player_id: null,
      })
      .eq("pool_id", poolId)
      .eq("square_number", row.square_number)
      .eq("claimed", false);

    if (!updateError) filled += 1;
  }

  await supabase
    .from(TABLES.pools)
    .update({ guaranteed_fill_at: now })
    .eq("id", poolId);

  await logPlatformAudit({
    eventType: filled > 0 ? "board.guarantee_completed" : "board.guarantee_triggered",
    summary: `Guaranteed Play: ${filled} platform-owned squares reserved`,
    gameType: "squareboards",
    entityType: "pool",
    entityId: poolId,
    metadata: { claimedBefore: claimed, platformSquares: filled },
  });

  let boardLocked = false;
  if (claimed + filled >= 100) {
    await dbLockAndDrawBoard(poolId);
    boardLocked = true;

    if (pool.game_id) {
      const game = await dbGetGame(pool.game_id as string);
      if (game) {
        const nextIndex = ((pool.board_index as number) ?? 1) + 1;
        const entryTierCents = (pool.entry_tier_cents as number | null) ?? 1000;
        await dbCreateMarketplaceBoard(game, nextIndex, entryTierCents);
      }
    }
  }

  return { triggered: true, squaresFilled: filled, boardLocked };
}

export async function isPlatformOwnedWinningSquare(
  poolId: string,
  squareNumber: number
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.squares)
    .select("platform_owned")
    .eq("pool_id", poolId)
    .eq("square_number", squareNumber)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.platform_owned);
}

export async function routePlatformWinToGrowthFund(input: {
  poolId: string;
  squareNumber: number;
  amountCents: number;
  quarter: string;
}): Promise<void> {
  await creditGrowthFund({
    amountCents: input.amountCents,
    sourceType: "squares_win",
    sourceId: `${input.poolId}:${input.quarter}`,
    description: `${PLATFORM_SQUARE_OWNER_LABEL} square #${input.squareNumber} won ${input.quarter}`,
  });
}

export { PLATFORM_SQUARE_OWNER_LABEL };
