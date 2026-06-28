"use client";

import type { UserSquareMeta } from "@/lib/live-arena/types";

interface MySquaresPanelProps {
  squares: UserSquareMeta[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  onSelect: (squareId: number) => void;
}

export default function MySquaresPanel({
  squares,
  winningSquareId,
  selectedSquareId,
  onSelect,
}: MySquaresPanelProps) {
  return (
    <section className="la-glass-card p-3 space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-sb-muted">
        My Squares
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {squares.map((sq) => {
          const isWinning = winningSquareId === sq.squareId;
          const isSelected = selectedSquareId === sq.squareId;

          return (
            <button
              key={sq.squareId}
              type="button"
              onClick={() => onSelect(sq.squareId)}
              className={[
                "shrink-0 w-[140px] p-2.5 rounded-xl border text-left transition-all duration-300",
                isSelected
                  ? "border-blue-400/60 bg-blue-500/15 scale-[1.02]"
                  : "border-white/[0.06] bg-white/[0.03] hover:border-white/15",
                isWinning ? "ring-1 ring-amber-400/50" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-lg font-bold text-white">
                  #{sq.displayNumber}
                </span>
                {isWinning && (
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Winning
                  </span>
                )}
              </div>
              <p className="text-[10px] text-sb-muted mt-1">
                Grid {sq.squareId + 1} ·{" "}
                {(sq.historicalWinRate * 100).toFixed(0)}% hist.
              </p>
              <p className="text-[10px] text-sb-gold mt-0.5 tabular-nums">
                ${sq.potentialPayout.toLocaleString()} potential
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
