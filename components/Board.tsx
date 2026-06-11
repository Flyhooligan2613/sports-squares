import type { BoardSquare } from "@/lib/types";

interface BoardProps {
  squares: BoardSquare[];
  onSquareClick: (id: number) => void;
  topNumbers?: number[];
  sideNumbers?: number[];
  homeTeam: string;
  awayTeam: string;
  locked?: boolean;
  featuredWinningSquareId?: number;
  pastWinningSquareIds?: number[];
}

export default function Board({
  squares,
  onSquareClick,
  topNumbers,
  sideNumbers,
  homeTeam,
  awayTeam,
  locked = false,
  featuredWinningSquareId,
  pastWinningSquareIds = [],
}: BoardProps) {
  const showNumbers =
    topNumbers?.length === 10 && sideNumbers?.length === 10;

  return (
    <div className="w-full max-w-2xl overflow-x-auto -mx-1 px-1">
      {showNumbers && (
        <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold text-center mb-1.5 pl-8">
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
                className="aspect-square flex items-center justify-center rounded-md bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs sm:text-sm font-bold axis-number"
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
            awayTeam={awayTeam}
            onSquareClick={onSquareClick}
            locked={locked}
            featuredWinningSquareId={featuredWinningSquareId}
            pastWinningSquareIds={pastWinningSquareIds}
          />
        ))}
      </div>

      {showNumbers && (
        <p
          className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mt-1.5"
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
  awayTeam,
  onSquareClick,
  locked,
  featuredWinningSquareId,
  pastWinningSquareIds,
}: {
  row: number;
  squares: BoardSquare[];
  sideNumber?: number;
  awayTeam: string;
  onSquareClick: (id: number) => void;
  locked: boolean;
  featuredWinningSquareId?: number;
  pastWinningSquareIds: number[];
}) {
  return (
    <>
      {sideNumber !== undefined ? (
        <div
          className="w-7 sm:w-8 aspect-square flex items-center justify-center rounded-md bg-purple-600/20 border border-purple-500/40 text-purple-300 font-mono text-xs sm:text-sm font-bold axis-number"
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

        return (
          <button
            key={square.id}
            type="button"
            onClick={() => onSquareClick(square.id)}
            disabled={disabled}
            className={[
              "relative aspect-square rounded-md text-[10px] font-bold transition-all border",
              isFeatured
                ? "winner-square-glow border-amber-400 text-white z-10"
                : isPastWinner
                  ? "border-amber-500/40 text-white"
                  : square.claimed
                    ? "cursor-default border-transparent text-white"
                    : locked
                      ? "cursor-not-allowed border-slate-700/50 bg-slate-800/50 text-slate-600"
                      : isSelected
                        ? "border-indigo-400 bg-indigo-500/30 text-indigo-200 scale-95"
                        : "border-slate-700 bg-slate-800 hover:border-indigo-500/50 hover:bg-slate-700 text-slate-500",
            ].join(" ")}
            style={
              square.claimed && owner && !isFeatured
                ? { backgroundColor: owner.color ?? "#6366f1" }
                : isFeatured && owner
                  ? { backgroundColor: owner.color ?? "#6366f1" }
                  : undefined
            }
            title={owner ? owner.name : `Square ${square.id + 1}`}
          >
            {isFeatured && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/50 winner-trophy-bounce">
                <svg
                  className="w-2.5 h-2.5 text-slate-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 3h14v2H5V3zm2 2v2c0 2.5 1.5 4.7 3.7 5.7L9 17H8v2h8v-2h-1l-.7-4.3c2.2-1 3.7-3.2 3.7-5.7V5h2V3H5v2h2zm2 0h8v2c0 2.2-1.4 4.1-3.5 4.8L12 11.5l-1.5-1.7C8.4 9.1 7 7.2 7 5z" />
                </svg>
              </span>
            )}
            {owner?.initials ?? (isSelected ? "✓" : "")}
          </button>
        );
      })}
    </>
  );
}
