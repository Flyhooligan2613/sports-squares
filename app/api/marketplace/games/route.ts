import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { dbListBoardsForGame } from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import { normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnSport } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const sport = normalizeEspnSport(searchParams.get("sport") as EspnSport);

  try {
    const games = await dbListGames({
      sport,
      status: ["scheduled", "live"],
    });

    const gamesWithBoards = await Promise.all(
      games.map(async (game) => {
        const boards = await dbListBoardsForGame(game.id);
        return { game, boards };
      })
    );

    return NextResponse.json({ sport, games: gamesWithBoards });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          safeApiErrorMessage(err, "load"),
      },
      { status: 500 }
    );
  }
}
