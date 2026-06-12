import Link from "next/link";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import { dbListBoardsForGame } from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import { getEspnSportConfig, normalizeEspnSport } from "@/lib/espn/sports";
import type { EspnSport } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import type { PoolRow } from "@/lib/database/types";

async function countUnclaimedForPool(poolId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from(TABLES.squares)
    .select("*", { count: "exact", head: true })
    .eq("pool_id", poolId)
    .eq("claimed", false);
  return count ?? 0;
}

function formatKickoff(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SportGamesPage({
  params,
}: {
  params: { sport: string };
}) {
  const sport = normalizeEspnSport(params.sport) as EspnSport;
  if (params.sport !== sport) notFound();

  const config = getEspnSportConfig(sport);
  let games: Awaited<ReturnType<typeof dbListGames>> = [];

  try {
    games = await dbListGames({
      sport,
      status: ["scheduled", "live"],
    });
  } catch {
    games = [];
  }

  const gamesWithBoards = await Promise.all(
    games.map(async (game) => {
      let boards: PoolRow[] = [];
      try {
        boards = await dbListBoardsForGame(game.id);
      } catch {
        boards = [];
      }

      const boardsWithAvailability = await Promise.all(
        boards.map(async (board) => ({
          board,
          remaining: await countUnclaimedForPool(board.id),
        }))
      );

      return { game, boards: boardsWithAvailability };
    })
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-8">
          <Link
            href="/#marketplace"
            className="text-sm text-sb-muted hover:text-white transition-colors"
          >
            ← Back to marketplace
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
            {config.label}
          </h1>
          <p className="text-sb-muted">
            Choose a game and pick an open board. SquareBoards manages every
            board automatically.
          </p>
        </div>

        {gamesWithBoards.length === 0 ? (
          <div className="landing-glass-card text-center py-16 px-6">
            <p className="text-white font-semibold text-lg mb-2">
              No games listed yet
            </p>
            <p className="text-sb-muted text-sm max-w-md mx-auto">
              Games sync automatically from live schedules. Check back soon or
              browse other sports.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {gamesWithBoards.map(({ game, boards }) => {
              const openBoards = boards.filter(
                (b) => b.board.status === "open" && b.remaining > 0
              );

              return (
                <article
                  key={game.id}
                  className="landing-glass-card landing-glass-card-hover sb-card-interactive p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-1 inline-flex items-center gap-2">
                        {game.status === "live" ? (
                          <>
                            <span className="sb-live-dot-sm" aria-hidden />
                            Live now
                          </>
                        ) : (
                          "Upcoming"
                        )}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {game.awayTeam}{" "}
                        <span className="text-sb-muted font-normal text-base">
                          vs
                        </span>{" "}
                        {game.homeTeam}
                      </h2>
                      <p className="text-sb-muted text-sm mt-1">
                        {formatKickoff(game.kickoffAt)}
                      </p>
                    </div>
                    <p className="text-sm text-sb-muted">
                      {boards.length} board{boards.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {boards.map(({ board, remaining }) => {
                      const open = board.status === "open" && remaining > 0;

                      return (
                        <div
                          key={board.id}
                          className="marketplace-board-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-sb-bg/50 border border-white/[0.06]"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">
                                Board {board.board_index}
                              </span>
                              <PoolStatusBadge status={board.status} />
                            </div>
                            <p className="text-sm text-sb-muted inline-flex items-center gap-1.5">
                              <Grid3X3 className="w-3.5 h-3.5" />
                              {board.status === "open"
                                ? `${remaining} squares left`
                                : `${100 - remaining}/100 sold`}
                              {board.cost_per_square > 0 && (
                                <>
                                  {" · "}$
                                  {Number(board.cost_per_square).toFixed(2)} per
                                  square
                                </>
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/pool/${board.id}`}
                            className={[
                              "sb-btn-primary inline-flex items-center justify-center gap-1 min-h-[44px] px-5 rounded-xl text-sm font-semibold",
                              open ? "" : "opacity-50 pointer-events-none",
                            ].join(" ")}
                          >
                            {open ? "Play this board" : "Closed"}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {openBoards.length === 0 && boards.length > 0 && (
                    <p className="text-xs text-sb-muted mt-3">
                      All boards for this game are locked or sold out. A new
                      board opens automatically when space is available.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer landing />
    </div>
  );
}
