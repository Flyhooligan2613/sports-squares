"use client";

import { Fragment } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveTvBoardData } from "@/lib/liveTv/types";

interface LiveBoardVisualizerProps {
  board: LiveTvBoardData | null;
}

export default function LiveBoardVisualizer({ board }: LiveBoardVisualizerProps) {
  if (!board) {
    return (
      <section>
        <h2 className="livetv-section-title">Live Board Visualizer</h2>
        <LandingGlassCard className="p-8 text-center">
          <p className="text-sb-muted">Featured board loading…</p>
        </LandingGlassCard>
      </section>
    );
  }

  const showNumbers =
    board.topNumbers?.length === 10 && board.sideNumbers?.length === 10;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="livetv-section-title mb-1">Live Board Visualizer</h2>
          <p className="text-sm text-sb-muted">
            {board.awayTeam} vs {board.homeTeam} · Board #{board.boardIndex}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-sb-muted">Prize Pool</p>
          <p className="text-lg font-bold text-sb-gold tabular-nums">
            {formatCurrency(board.prizePool)}
          </p>
        </div>
      </div>

      <LandingGlassCard glow className="livetv-board-panel p-4 sm:p-6">
        {showNumbers ? (
          <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold text-center mb-2">
            {board.homeTeam}
          </p>
        ) : null}

        <div
          className="grid gap-1 w-full max-w-2xl mx-auto livetv-board-grid"
          style={{ gridTemplateColumns: "auto repeat(10, 1fr)" }}
        >
          <div className="w-7 sm:w-8" />
          {showNumbers
            ? board.topNumbers!.map((n, i) => (
                <div
                  key={`top-${i}`}
                  className="livetv-axis aspect-square flex items-center justify-center rounded-md text-xs font-bold"
                >
                  {n}
                </div>
              ))
            : Array.from({ length: 10 }, (_, i) => (
                <div key={`empty-top-${i}`} className="aspect-square" />
              ))}

          {Array.from({ length: 10 }, (_, row) => (
            <Fragment key={`row-${row}`}>
              {showNumbers ? (
                <div className="livetv-axis w-7 sm:w-8 aspect-square flex items-center justify-center rounded-md text-xs font-bold">
                  {board.sideNumbers![row]}
                </div>
              ) : (
                <div className="w-7 sm:w-8" />
              )}
              {board.squares.slice(row * 10, row * 10 + 10).map((square) => {
                const isFeatured = board.featuredWinningSquareId === square.id;
                const isPast = board.pastWinningSquareIds.includes(square.id);
                return (
                  <div
                    key={square.id}
                    className={[
                      "livetv-square aspect-square rounded-md border text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all",
                      square.claimed ? "livetv-square-claimed" : "",
                      square.recentlyPurchased ? "livetv-square-recent" : "",
                      isFeatured ? "livetv-square-winner" : "",
                      isPast ? "livetv-square-past-winner" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      square.claimed && square.color
                        ? { backgroundColor: square.color }
                        : undefined
                    }
                  >
                    {square.initials ?? ""}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-sb-muted">
          <span>{board.fillPercent}% filled</span>
          <span>{100 - board.fillPercent} open</span>
          <span className="capitalize">{board.status.replace("-", " ")}</span>
        </div>
      </LandingGlassCard>
    </section>
  );
}
