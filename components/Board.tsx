import type { BoardSquare } from "@/lib/types";
import {
  formatSquareDisplayLabel,
  getSquareDisplayNumber,
  hasInnerSquareNumbers,
} from "@/lib/engines/squareDisplay";

interface BoardProps {
  squares: BoardSquare[];
  onSquareClick: (id: number) => void;
  topNumbers?: number[];
  sideNumbers?: number[];
  innerNumbers?: number[];
  homeTeam: string;
  awayTeam: string;
  locked?: boolean;
  featuredWinningSquareId?: number;
  pastWinningSquareIds?: number[];
  highlightSquareIds?: number[];
  activatedHighlightSquareIds?: number[];
}

export default function Board({
  squares,
  onSquareClick,
  topNumbers,
  sideNumbers,
  innerNumbers,
  homeTeam,
  awayTeam,
  locked = false,
  featuredWinningSquareId,
  pastWinningSquareIds = [],
  highlightSquareIds = [],
  activatedHighlightSquareIds = [],
}: BoardProps) {
  const showNumbers =
    topNumbers?.length === 10 && sideNumbers?.length === 10;
  const showInnerNumbers = showNumbers && hasInnerSquareNumbers(innerNumbers);

  return (
    <div
      className={[
        "sb-board-wrap w-full max-w-2xl overflow-x-auto -mx-1 px-1",
        locked ? "sb-board-wrap--locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showNumbers && (
        <p className="text-[10px] uppercase tracking-wider sb-board-label-home font-semibold text-center mb-1.5 pl-8">
          {homeTeam}
        </p>
      )}

      <div
        className="grid gap-1 w-full"
        style={{ gridTemplateColumns: "auto repeat(10, 1fr)" }}
      >
        <div className="w-7 sm:w-8" />

        {showNumbers
          ? topNumbers!.map((n, i) => (
              <div
                key={`top-${i}`}
                className="aspect-square flex items-center justify-center rounded-md sb-board-axis-home font-mono text-xs sm:text-sm font-bold axis-number"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {n}
              </div>
            ))
          : Array.from({ length: 10 }, (_, i) => (
              <div key={`top-empty-${i}`} className="aspect-square" />
            ))}

        {Array.from({ length: 10 }, (_, row) => (
          <Row
            key={row}
            row={row}
            squares={squares.slice(row * 10, row * 10 + 10)}
            sideNumber={showNumbers ? sideNumbers![row] : undefined}
            innerNumbers={showInnerNumbers ? innerNumbers : undefined}
            awayTeam={awayTeam}
            onSquareClick={onSquareClick}
            locked={locked}
            featuredWinningSquareId={featuredWinningSquareId}
            pastWinningSquareIds={pastWinningSquareIds}
            highlightSquareIds={highlightSquareIds}
            activatedHighlightSquareIds={activatedHighlightSquareIds}
          />
        ))}
      </div>

      {showNumbers && (
        <p
          className="text-[10px] uppercase tracking-wider sb-board-label-away font-semibold mt-1.5"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {awayTeam}
        </p>
      )}
    </div>
  );
}

function Row({
  row,
  squares,
  sideNumber,
  innerNumbers,
  awayTeam,
  onSquareClick,
  locked,
  featuredWinningSquareId,
  pastWinningSquareIds,
  highlightSquareIds,
  activatedHighlightSquareIds,
}: {
  row: number;
  squares: BoardSquare[];
  sideNumber?: number;
  innerNumbers?: number[];
  awayTeam: string;
  onSquareClick: (id: number) => void;
  locked: boolean;
  featuredWinningSquareId?: number;
  pastWinningSquareIds: number[];
  highlightSquareIds: number[];
  activatedHighlightSquareIds: number[];
}) {
  return (
    <>
      {sideNumber !== undefined ? (
        <div
          className="w-7 sm:w-8 aspect-square flex items-center justify-center rounded-md sb-board-axis-away font-mono text-xs sm:text-sm font-bold axis-number"
          style={{ animationDelay: `${row * 0.05}s` }}
          title={awayTeam}
        >
          {sideNumber}
        </div>
      ) : (
        <div className="w-7 sm:w-8" />
      )}

      {squares.map((square) => {
        const owner = square.owner;
        const isSelected = square.selected && !square.claimed;
        const disabled = square.claimed || locked;
        const isFeatured = featuredWinningSquareId === square.id;
        const isPastWinner =
          !isFeatured && pastWinningSquareIds.includes(square.id);
        const isHighlight = highlightSquareIds.includes(square.id);
        const isHighlightActivated = activatedHighlightSquareIds.includes(
          square.id
        );
        const showHighlightBadge = isHighlight && !isFeatured;
        const displayNumber = getSquareDisplayNumber(square.id, innerNumbers);
        const squareLabel = formatSquareDisplayLabel(square.id, innerNumbers);

        return (
          <button
            key={square.id}
            type="button"
            onClick={() => onSquareClick(square.id)}
            disabled={disabled}
            className={[
              "sb-board-square relative aspect-square rounded-md text-[10px] font-bold border",
              isFeatured
                ? "winner-square-glow border-amber-400 text-white z-10"
                : isPastWinner
                  ? "sb-board-square-past-winner text-white"
                  : isHighlightActivated
                    ? "highlight-square-activated text-white z-[1]"
                    : isHighlight
                      ? "highlight-square-glow text-white z-[1]"
                      : square.claimed
                        ? "cursor-default border-transparent text-white sb-board-square-claimed"
                        : locked
                          ? "sb-board-square-locked"
                          : isSelected
                            ? "sb-board-square-selected"
                            : "sb-board-square-available",
            ].join(" ")}
            style={
              square.claimed && owner && !isFeatured
                ? { backgroundColor: owner.color ?? "#5B4CF7" }
                : isFeatured && owner
                  ? { backgroundColor: owner.color ?? "#5B4CF7" }
                  : isHighlight && owner
                    ? { backgroundColor: owner.color ?? "#5B4CF7" }
                    : undefined
            }
            title={
              isHighlight
                ? isHighlightActivated
                  ? `Highlight Square™ activated — ${owner?.name ?? "Bonus square"}`
                  : `Highlight Square™ — mystery bonus if this square wins a checkpoint`
                : owner
                  ? owner.name
                  : squareLabel
            }
            aria-label={
              owner
                ? `${owner.name}${displayNumber != null ? `, square ${displayNumber}` : ""}`
                : squareLabel
            }
          >
            {isFeatured && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/50 winner-trophy-bounce">
                <svg
                  className="w-2.5 h-2.5 text-sb-bg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 3h14v2H5V3zm2 2v2c0 2.5 1.5 4.7 3.7 5.7L9 17H8v2h8v-2h-1l-.7-4.3c2.2-1 3.7-3.2 3.7-5.7V5h2V3H5v2h2zm2 0h8v2c0 2.2-1.4 4.1-3.5 4.8L12 11.5l-1.5-1.7C8.4 9.1 7 7.2 7 5z" />
                </svg>
              </span>
            )}
            {showHighlightBadge && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-lg ${
                  isHighlightActivated
                    ? "highlight-star-activated"
                    : "highlight-star-badge"
                }`}
                aria-hidden
              >
                ⭐
              </span>
            )}
            {owner?.initials ??
              (isSelected ? "✓" : displayNumber != null ? String(displayNumber) : "")}
          </button>
        );
      })}
    </>
  );
}
