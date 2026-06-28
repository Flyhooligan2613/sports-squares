"use client";

import { useMemo, type CSSProperties } from "react";
import { getSquareDisplayNumber } from "@/lib/engines/squareDisplay";
import type { LiveContest } from "@/lib/live-arena/types";

interface LiveArenaBoardProps {
  contest: LiveContest;
  userSquareIds: number[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  revealed: boolean;
  zoomed: boolean;
  onSquareClick: (squareId: number) => void;
}

function WinParticles({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 28 + (i % 3) * 8;
    return {
      id: i,
      px: `${Math.cos(angle) * dist}px`,
      py: `${Math.sin(angle) * dist}px`,
    };
  });

  return (
    <div className="la-particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="la-particle"
          style={
            {
              left: "50%",
              top: "50%",
              "--px": p.px,
              "--py": p.py,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function LiveArenaBoard({
  contest,
  userSquareIds,
  winningSquareId,
  selectedSquareId,
  revealed,
  zoomed,
  onSquareClick,
}: LiveArenaBoardProps) {
  const { topNumbers, sideNumbers, innerNumbers, homeTeam, awayTeam } = contest;

  const userSet = useMemo(() => new Set(userSquareIds), [userSquareIds]);

  return (
    <div className="la-board-stage w-full max-w-[420px] mx-auto px-1">
      <div
        className={[
          "la-board-container p-2.5 sm:p-3 la-board-float",
          zoomed ? "la-board-zoom" : "",
        ].join(" ")}
      >
        <p className="text-[9px] uppercase tracking-widest text-center text-blue-400/70 font-semibold mb-1.5">
          {homeTeam}
        </p>

        <div
          className={["grid gap-[3px] w-full la-grid-draw", revealed ? "" : "opacity-0"].join(" ")}
          style={{ gridTemplateColumns: "auto repeat(10, 1fr)" }}
        >
          <div className="w-5 sm:w-6" />

          {topNumbers.map((n, i) => (
            <div
              key={`top-${i}`}
              className="la-axis-reveal aspect-square flex items-center justify-center rounded-md bg-blue-500/10 border border-blue-400/20 font-mono text-[10px] sm:text-xs font-bold text-blue-300"
              style={{ animationDelay: `${0.05 + i * 0.04}s` }}
            >
              {revealed ? n : ""}
            </div>
          ))}

          {Array.from({ length: 10 }, (_, row) => (
            <BoardRow
              key={row}
              row={row}
              sideNumber={sideNumbers[row]}
              revealed={revealed}
              rowDelay={0.1 + row * 0.05}
              userSet={userSet}
              innerNumbers={innerNumbers}
              winningSquareId={winningSquareId}
              selectedSquareId={selectedSquareId}
              onSquareClick={onSquareClick}
              awayTeam={awayTeam}
            />
          ))}
        </div>

        <p
          className="text-[9px] uppercase tracking-widest text-purple-400/60 font-semibold mt-1.5 ml-1"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: "2rem" }}
        >
          {awayTeam}
        </p>
      </div>
    </div>
  );
}

function BoardRow({
  row,
  sideNumber,
  revealed,
  rowDelay,
  userSet,
  innerNumbers,
  winningSquareId,
  selectedSquareId,
  onSquareClick,
  awayTeam,
}: {
  row: number;
  sideNumber: number;
  revealed: boolean;
  rowDelay: number;
  userSet: Set<number>;
  innerNumbers: number[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  onSquareClick: (id: number) => void;
  awayTeam: string;
}) {
  return (
    <>
      <div
        className="la-axis-reveal w-5 sm:w-6 aspect-square flex items-center justify-center rounded-md bg-purple-500/10 border border-purple-400/20 font-mono text-[10px] sm:text-xs font-bold text-purple-300"
        style={{ animationDelay: `${rowDelay}s` }}
        title={awayTeam}
      >
        {revealed ? sideNumber : ""}
      </div>

      {Array.from({ length: 10 }, (_, col) => {
        const squareId = row * 10 + col;
        const isUser = userSet.has(squareId);
        const isWinning = winningSquareId === squareId;
        const isSelected = selectedSquareId === squareId;
        const displayNum = getSquareDisplayNumber(squareId, innerNumbers);

        return (
          <button
            key={squareId}
            type="button"
            onClick={() => onSquareClick(squareId)}
            className={[
              "la-square-cell relative aspect-square rounded-[4px] border text-[8px] sm:text-[9px] font-bold min-h-[28px] min-w-[28px]",
              isWinning
                ? "la-square-winning bg-amber-500/25 text-amber-100"
                : isUser
                  ? "la-square-owned bg-blue-500/20 text-blue-100 border-blue-400/30"
                  : "bg-white/[0.03] border-white/[0.06] text-white/30",
              isSelected ? "la-square-selected" : "",
            ].join(" ")}
            aria-label={
              isUser
                ? `Your square ${displayNum ?? squareId}${isWinning ? ", currently winning" : ""}`
                : `Square ${displayNum ?? squareId}`
            }
          >
            {revealed && isUser && (
              <span className="relative z-[1]">{displayNum ?? "•"}</span>
            )}
            {isWinning && <WinParticles active={isWinning} />}
          </button>
        );
      })}
    </>
  );
}
