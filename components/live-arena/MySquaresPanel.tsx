"use client";

import type { UserSquareMeta, UserSquareStatus } from "@/lib/live-arena/types";

interface MySquaresPanelProps {
  squares: UserSquareMeta[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  onSelect: (squareId: number) => void;
}

const STATUS_ORDER: UserSquareStatus[] = ["winning", "active", "in-play"];

const STATUS_CHIP: Record<
  UserSquareStatus,
  { label: string; className: string }
> = {
  winning: { label: "Winning", className: "la-chip--winning" },
  active: { label: "Active", className: "la-chip--active" },
  "in-play": { label: "In Play", className: "la-chip--inplay" },
};

export default function MySquaresPanel({
  squares,
  winningSquareId,
  selectedSquareId,
  onSelect,
}: MySquaresPanelProps) {
  const chips = STATUS_ORDER.map((status) => {
    const match = squares.filter((sq) => {
      if (status === "winning") return winningSquareId === sq.squareId;
      return sq.status === status && winningSquareId !== sq.squareId;
    });
    return { status, squares: match };
  }).filter((g) => g.squares.length > 0);

  return (
    <section className="la-glass-card p-3 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-sb-muted">
        My Squares
      </h2>

      <div className="flex flex-wrap gap-2">
        {chips.map(({ status, squares: group }) =>
          group.map((sq) => {
            const chip = STATUS_CHIP[status];
            const isSelected = selectedSquareId === sq.squareId;
            const isWinning = winningSquareId === sq.squareId;

            return (
              <button
                key={sq.squareId}
                type="button"
                onClick={() => onSelect(sq.squareId)}
                className={[
                  "la-square-chip min-h-[44px]",
                  chip.className,
                  isSelected ? "la-square-chip--selected" : "",
                  isWinning ? "la-square-chip--live-winning" : "",
                ].join(" ")}
                aria-pressed={isSelected}
                aria-label={`Square ${sq.displayNumber}, ${chip.label}`}
              >
                <span className="la-square-chip__num">{sq.displayNumber}</span>
                <span className="la-square-chip__status">{chip.label}</span>
                {isWinning && (
                  <span className="la-win-pattern la-square-chip__pattern" aria-hidden />
                )}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
