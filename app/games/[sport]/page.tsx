import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import GameBoardRow from "@/components/marketplace/GameBoardRow";
import StatusBadge from "@/components/ui/StatusBadge";
import { dbListBoardsForGame } from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import {
  estimatePoolPrizeCents,
  formatPrizePool,
} from "@/lib/marketplace/gameBoardStats";
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
        boards.map(async (board) => {
          const remaining = await countUnclaimedForPool(board.id);
          const prizeCents = await estimatePoolPrizeCents(board.id).catch(() => 0);
          return {
            board,
            remaining,
            prizePoolLabel: formatPrizePool(prizeCents),
          };
        })
      );

      const openBoard = boardsWithAvailability.find(
        (b) => b.board.status === "open" && b.remaining > 0
      );

      return { game, boards: boardsWithAvailability, openBoard };
    })
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-8 sb-xp-hero-enter">
          <Link
            href="/#marketplace"
            className="text-sm text-sb-muted hover:text-white transition-colors"
          >
            ← Back to marketplace
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
            {config.label}
          </h1>
          <p className="text-sb-muted max-w-2xl">
            Choose a game and lock in squares. When a board fills, the next board
            opens automatically until kickoff.
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
            {gamesWithBoards.map(({ game, boards, openBoard }) => {
              const openCount = boards.filter(
                (b) => b.board.status === "open" && b.remaining > 0
              ).length;

              return (
                <article
                  key={game.id}
                  className="landing-glass-card landing-glass-card-hover sb-card-interactive p-5 sm:p-6 sb-stagger-item"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="mb-2">
                        {game.status === "live" ? (
                          <StatusBadge variant="live" pulse dot>
                            Live Now
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="upcoming">Upcoming</StatusBadge>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {game.awayTeam}{" "}
                        <span className="text-sb-muted font-normal text-base">
                          vs
                        </span>{" "}
                        {game.homeTeam}
                      </h2>
                      <p className="text-sb-muted text-sm mt-1">
                        Kickoff · {formatKickoff(game.kickoffAt)}
                      </p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <p className="text-white font-semibold">
                        {boards.length} board{boards.length === 1 ? "" : "s"}
                      </p>
                      <p className="text-sb-muted">
                        {openCount} open · Board #
                        {openBoard?.board.board_index ?? boards.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {boards.map(({ board, remaining, prizePoolLabel }) => (
                      <GameBoardRow
                        key={board.id}
                        poolId={board.id}
                        boardIndex={board.board_index ?? 1}
                        status={board.status}
                        remaining={remaining}
                        costPerSquare={Number(board.cost_per_square ?? 0)}
                        prizePoolLabel={prizePoolLabel}
                        isCurrentOpen={
                          openBoard?.board.id === board.id &&
                          board.status === "open" &&
                          remaining > 0
                        }
                      />
                    ))}
                  </div>

                  {openCount === 0 && boards.length > 0 && (
                    <p className="text-xs text-sb-muted mt-3">
                      All boards are locked or sold out. The next board opens
                      automatically when the current one fills.
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
