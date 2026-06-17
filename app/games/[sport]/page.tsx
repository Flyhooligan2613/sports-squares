import SportHubBackdropShell from "@/components/sports/SportHubBackdropShell";
import Link from "next/link";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import GameBoardRow from "@/components/marketplace/GameBoardRow";
import SportEntryTierNav from "@/components/marketplace/SportEntryTierNav";
import SportGamesIntro from "@/components/marketplace/SportGamesIntro";
import SportOffSeasonPanel from "@/components/marketplace/SportOffSeasonPanel";
import StatusBadge from "@/components/ui/StatusBadge";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { dbListBoardsForGame } from "@/lib/database/services/boards";
import { dbListGames } from "@/lib/database/services/games";
import {
  estimatePoolPrizeCents,
  formatPrizePool,
} from "@/lib/marketplace/gameBoardStats";
import { getEspnSportConfig, normalizeEspnSport } from "@/lib/espn/sports";
import { isMarketplaceOffSeason } from "@/lib/marketplace/seasonStatus";
import {
  formatTierCents,
  parseEntryTierParam,
} from "@/lib/platform/core/entryTiers";
import type { EspnSport } from "@/lib/types";
import { learnHowToPlayHref } from "@/lib/highlight/learnLinks";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { notFound } from "next/navigation";

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
  searchParams,
}: {
  params: { sport: string };
  searchParams: { tier?: string };
}) {
  const sport = normalizeEspnSport(params.sport) as EspnSport;
  if (params.sport !== sport) notFound();

  const tierCents = parseEntryTierParam(searchParams.tier);
  const tierLabel = formatTierCents(tierCents);
  const config = getEspnSportConfig(sport);
  const offSeason = isMarketplaceOffSeason(sport);

  if (offSeason) {
    return (
      <SportHubBackdropShell sportId={sport} className="min-h-[calc(100vh-3.5rem)]">
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
          <div className="mb-8 sb-xp-hero-enter">
            <Link
              href="/#marketplace"
              className="text-sm text-sb-muted hover:text-white transition-colors"
            >
              ← Back to marketplace
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {config.label} Squares
              </h1>
              <Button href={learnHowToPlayHref(sport)} variant="secondary" className="shrink-0">
                How to Play
              </Button>
            </div>
          </div>
          <SportOffSeasonPanel sport={sport} />
        </main>
        <Footer landing />
      </SportHubBackdropShell>
    );
  }

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
      let boards = await dbListBoardsForGame(game.id, tierCents).catch(() => []);

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
    <SportHubBackdropShell sportId={sport} className="min-h-[calc(100vh-3.5rem)]">
      <SportGamesIntro sport={sport} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-8 sb-xp-hero-enter">
          <Link
            href="/#marketplace"
            className="text-sm text-sb-muted hover:text-white transition-colors"
          >
            ← Back to marketplace
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {config.label}
              </h1>
              <p className="text-sb-muted max-w-2xl">
                Choose a buy-in level, pick a game, and lock in squares. Every tier runs
                automatically — when a board fills, the next opens until kickoff.
              </p>
            </div>
            <Button href={learnHowToPlayHref(sport)} variant="secondary" className="shrink-0">
              How to Play
            </Button>
          </div>
        </div>

        <LandingGlassCard className="p-5 sm:p-6 mb-8">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-4">
            Buy-in tier · showing {tierLabel} boards
          </p>
          <Suspense fallback={<p className="text-sb-muted text-sm">Loading tiers…</p>}>
            <SportEntryTierNav sport={sport} />
          </Suspense>
        </LandingGlassCard>

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
                        {boards.length} {tierLabel} board{boards.length === 1 ? "" : "s"}
                      </p>
                      <p className="text-sb-muted">
                        {openCount} open · Board #
                        {(openBoard?.board.board_index ?? boards.length) || 1}
                      </p>
                    </div>
                  </div>

                  {boards.length === 0 ? (
                    <p className="text-sm text-sb-muted">
                      No {tierLabel} board yet — the next marketplace sync will create one
                      automatically.
                    </p>
                  ) : (
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
                          tierLabel={tierLabel}
                          isCurrentOpen={
                            openBoard?.board.id === board.id &&
                            board.status === "open" &&
                            remaining > 0
                          }
                        />
                      ))}
                    </div>
                  )}

                  {openCount === 0 && boards.length > 0 && (
                    <p className="text-xs text-sb-muted mt-3">
                      All {tierLabel} boards are locked or sold out. The next board opens
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
    </SportHubBackdropShell>
  );
}
