import {
  dbCountClaimedSquares,
  dbCreateMarketplaceBoard,
  dbEnsureBoardForGame,
  dbGetOpenBoardForGame,
  dbListBoardsForGame,
  dbLockAndDrawBoard,
} from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import type { Game } from "@/lib/types";

export interface BoardEngineResult {
  boardsEnsured: number;
  boardsLocked: number;
  boardsSpawned: number;
  fullBoardsProcessed: number;
  errors: string[];
}

function isBeforeKickoff(game: Game): boolean {
  return new Date(game.kickoffAt).getTime() > Date.now();
}

export async function processFullOpenBoards(): Promise<number> {
  const games = await dbListGames({
    status: ["scheduled", "live"],
  });

  let processed = 0;

  for (const game of games) {
    if (!isBeforeKickoff(game)) continue;

    const openBoard = await dbGetOpenBoardForGame(game.id);
    if (!openBoard) continue;

    const claimed = await dbCountClaimedSquares(openBoard.id);
    if (claimed < 100) continue;

    await dbLockAndDrawBoard(openBoard.id);
    const nextIndex = openBoard.board_index + 1;
    await dbCreateMarketplaceBoard(game, nextIndex);
    processed += 1;
  }

  return processed;
}

export async function lockBoardsAtKickoff(): Promise<number> {
  const games = await dbListGames({
    status: ["scheduled", "live"],
  });

  let locked = 0;
  const now = Date.now();

  for (const game of games) {
    if (new Date(game.kickoffAt).getTime() > now) continue;

    const boards = await dbListBoardsForGame(game.id);
    for (const board of boards) {
      if (board.status !== "open") continue;
      await dbLockAndDrawBoard(board.id);
      locked += 1;
    }
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

    const openBoard = await dbGetOpenBoardForGame(game.id);
    if (openBoard) continue;

    await dbEnsureBoardForGame(game.id);
    ensured += 1;
  }

  return ensured;
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
    boardsLocked = await lockBoardsAtKickoff();
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
