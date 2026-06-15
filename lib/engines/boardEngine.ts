import {
  dbCountClaimedSquares,
  dbCreateMarketplaceBoard,
  dbEnsureAllTierBoardsForGame,
  dbGetOpenBoardForGame,
  dbListBoardsForGame,
  dbLockAndDrawBoard,
} from "@/lib/database/services/boards";
import { maybeCompleteGuaranteedBoard } from "@/lib/platform/core/guaranteedPlayEngine";
import { PLATFORM_ENTRY_TIERS } from "@/lib/platform/core/entryTiers";
import {
  dbGetGame,
  dbListGames,
  isGameStarted,
} from "@/lib/database/services/games";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Game } from "@/lib/types";

export interface BoardEngineResult {
  boardsEnsured: number;
  boardsLocked: number;
  boardsSpawned: number;
  fullBoardsProcessed: number;
  errors: string[];
}

function isBeforeKickoff(game: Game): boolean {
  return !isGameStarted(game);
}

export async function processFullOpenBoards(): Promise<number> {
  const games = await dbListGames({
    status: ["scheduled", "live"],
  });

  let processed = 0;

  for (const game of games) {
    if (!isBeforeKickoff(game)) continue;

    for (const tier of PLATFORM_ENTRY_TIERS) {
      const openBoard = await dbGetOpenBoardForGame(game.id, tier.cents);
      if (!openBoard) continue;

      await maybeCompleteGuaranteedBoard(openBoard.id);

      const claimed = await dbCountClaimedSquares(openBoard.id);
      if (claimed < 100) continue;

      await dbLockAndDrawBoard(openBoard.id);
      const nextIndex = openBoard.board_index + 1;
      await dbCreateMarketplaceBoard(game, nextIndex, tier.cents);
      processed += 1;
    }
  }

  return processed;
}

/** Lock and randomize every open marketplace board once its game has started. */
export async function lockBoardsAtGameStart(): Promise<number> {
  const games = await dbListGames({
    status: ["scheduled", "live"],
  });

  let locked = 0;

  for (const game of games) {
    if (!isGameStarted(game)) continue;

    const boards = await dbListBoardsForGame(game.id);
    for (const board of boards) {
      if (board.status !== "open") continue;
      await dbLockAndDrawBoard(board.id);
      locked += 1;
    }
  }

  locked += await lockStandaloneOpenPools();

  return locked;
}

/** @deprecated Use lockBoardsAtGameStart — kept for callers during transition. */
export async function lockBoardsAtKickoff(): Promise<number> {
  return lockBoardsAtGameStart();
}

async function lockStandaloneOpenPools(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  let locked = 0;

  const liveGames = await dbListGames({ status: ["live", "final"] });
  for (const game of liveGames) {
    const { data: pools, error } = await supabase
      .from(TABLES.pools)
      .select("id, status")
      .eq("status", "open")
      .eq("espn_game_id", game.espnGameId)
      .eq("espn_sport", game.espnSport)
      .is("game_id", null);

    if (error) throw error;

    for (const pool of pools ?? []) {
      await dbLockAndDrawBoard(pool.id as string);
      locked += 1;
    }
  }

  const { data: kickoffPools, error: kickoffError } = await supabase
    .from(TABLES.pools)
    .select("id, status")
    .eq("status", "open")
    .not("kickoff_at", "is", null)
    .lte("kickoff_at", now);

  if (kickoffError) throw kickoffError;

  for (const pool of kickoffPools ?? []) {
    await dbLockAndDrawBoard(pool.id as string);
    locked += 1;
  }

  return locked;
}

export async function ensureOpenBoardsForUpcomingGames(): Promise<number> {
  const games = await dbListGames({
    status: ["scheduled"],
  });

  let ensured = 0;

  for (const game of games) {
    if (!isBeforeKickoff(game)) continue;
    ensured += await dbEnsureAllTierBoardsForGame(game.id);
  }

  return ensured;
}

export async function maybeAdvanceBoardAfterClaim(poolId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data: poolRow, error } = await supabase
    .from(TABLES.pools)
    .select("id, game_id, board_index, status, kickoff_at, entry_tier_cents")
    .eq("id", poolId)
    .maybeSingle();

  if (error || !poolRow || poolRow.status !== "open" || !poolRow.game_id) {
    return false;
  }

  if (poolRow.kickoff_at && new Date(poolRow.kickoff_at as string).getTime() <= Date.now()) {
    return false;
  }

  if (poolRow.game_id) {
    const game = await dbGetGame(poolRow.game_id as string);
    if (game && isGameStarted(game)) return false;
  }

  await maybeCompleteGuaranteedBoard(poolId);

  const refreshedClaimed = await dbCountClaimedSquares(poolId);
  if (refreshedClaimed < 100) return false;

  const game = await dbGetGame(poolRow.game_id as string);
  if (!game) return false;

  const entryTierCents = (poolRow.entry_tier_cents as number | null) ?? 1000;

  await dbLockAndDrawBoard(poolId);
  const nextIndex = (poolRow.board_index ?? 1) + 1;
  await dbCreateMarketplaceBoard(game, nextIndex, entryTierCents);
  return true;
}

export async function runBoardEngine(): Promise<BoardEngineResult> {
  const errors: string[] = [];
  let boardsEnsured = 0;
  let boardsLocked = 0;
  let fullBoardsProcessed = 0;
  let boardsSpawned = 0;

  try {
    fullBoardsProcessed = await processFullOpenBoards();
    boardsSpawned = fullBoardsProcessed;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Full board processing failed");
  }

  try {
    boardsLocked = await lockBoardsAtGameStart();
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Kickoff lock failed");
  }

  try {
    boardsEnsured = await ensureOpenBoardsForUpcomingGames();
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Board ensure failed");
  }

  return {
    boardsEnsured,
    boardsLocked,
    boardsSpawned,
    fullBoardsProcessed,
    errors,
  };
}
