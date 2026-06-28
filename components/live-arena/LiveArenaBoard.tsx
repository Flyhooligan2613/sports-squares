"use client";

import { useMemo, type CSSProperties } from "react";
import { getSquareDisplayNumber } from "@/lib/engines/squareDisplay";
import type { WinningSquareMatch } from "@/lib/live-arena/squareUtils";
import type { BoardRevealPhase, LiveContest } from "@/lib/live-arena/types";

interface LiveArenaBoardProps {
  contest: LiveContest;
  userSquareIds: number[];
  winningSquareId: number | null;
  winningMatch: WinningSquareMatch | null;
  selectedSquareId: number | null;
  revealPhase: BoardRevealPhase;
  zoomed: boolean;
  signatureActive: boolean;
  boardReacting: boolean;
  onSquareClick: (squareId: number) => void;
}

function WinParticles({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 24 + (i % 4) * 10;
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
  winningMatch,
  selectedSquareId,
  revealPhase,
  zoomed,
  signatureActive,
  boardReacting,
  onSquareClick,
}: LiveArenaBoardProps) {
  const { topNumbers, sideNumbers, innerNumbers, homeTeam, awayTeam } = contest;
  const userSet = useMemo(() => new Set(userSquareIds), [userSquareIds]);
  const showGrid = revealPhase !== "hidden";
  const showNumbers = revealPhase === "numbers" || revealPhase === "owned" || revealPhase === "complete";
  const showOwned = revealPhase === "owned" || revealPhase === "complete";
  const fullyRevealed = revealPhase === "complete";

  const rowIdx = winningMatch?.row ?? -1;
  const colIdx = winningMatch?.col ?? -1;

  return (
    <div className="la-board-stage w-full mx-auto">
      <div
        className={[
          "la-board-container la-board-depth",
          zoomed ? "la-board-zoom" : "",
          boardReacting ? "la-board-react" : "",
        ].join(" ")}
      >
        <p className="la-board-home-label">{homeTeam}</p>

        <div className="la-board-grid-wrap">
          <div
            className={[
              "la-board-grid",
              showGrid ? "la-board-grid--visible" : "",
              signatureActive ? "la-board-grid--signature" : "",
            ].join(" ")}
          >
            {/* Corner + top axis */}
            <div className="la-axis-cell la-axis-corner" aria-hidden />
            {topNumbers.map((n, i) => (
              <div
                key={`top-${i}`}
                className={[
                  "la-axis-cell la-axis-top",
                  signatureActive && colIdx === i ? "la-axis-highlight-col" : "",
                ].join(" ")}
                style={{ animationDelay: `${0.04 + i * 0.035}s` }}
              >
                {showGrid ? n : ""}
              </div>
            ))}

            {/* Rows: side axis + squares */}
            {Array.from({ length: 10 }, (_, row) => (
              <BoardRow
                key={row}
                row={row}
                sideNumber={sideNumbers[row]}
                showGrid={showGrid}
                showNumbers={showNumbers}
                showOwned={showOwned}
                fullyRevealed={fullyRevealed}
                rowDelay={0.08 + row * 0.04}
                userSet={userSet}
                innerNumbers={innerNumbers}
                winningSquareId={winningSquareId}
                selectedSquareId={selectedSquareId}
                signatureActive={signatureActive}
                highlightRow={signatureActive && rowIdx === row}
                colIdx={colIdx}
                onSquareClick={onSquareClick}
              />
            ))}

            {/* Signature crosshair lines */}
            {signatureActive && winningMatch && (
              <>
                <div
                  className="la-signature-line la-signature-line--h"
                  style={{ "--la-row": rowIdx } as CSSProperties}
                  aria-hidden
                />
                <div
                  className="la-signature-line la-signature-line--v"
                  style={{ "--la-col": colIdx } as CSSProperties}
                  aria-hidden
                />
                <div
                  className="la-signature-intersect"
                  style={
                    {
                      "--la-row": rowIdx,
                      "--la-col": colIdx,
                    } as CSSProperties
                  }
                  aria-hidden
                />
              </>
            )}
          </div>

          <p className="la-board-away-label">{awayTeam}</p>
        </div>

        {signatureActive && winningSquareId != null && (
          <p className="la-signature-caption">🏆 CURRENTLY WINNING</p>
        )}
      </div>
    </div>
  );
}

function BoardRow({
  row,
  sideNumber,
  showGrid,
  showNumbers,
  showOwned,
  fullyRevealed,
  rowDelay,
  userSet,
  innerNumbers,
  winningSquareId,
  selectedSquareId,
  signatureActive,
  highlightRow,
  colIdx,
  onSquareClick,
}: {
  row: number;
  sideNumber: number;
  showGrid: boolean;
  showNumbers: boolean;
  showOwned: boolean;
  fullyRevealed: boolean;
  rowDelay: number;
  userSet: Set<number>;
  innerNumbers: number[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  signatureActive: boolean;
  highlightRow: boolean;
  colIdx: number;
  onSquareClick: (id: number) => void;
}) {
  return (
    <>
      <div
        className={[
          "la-axis-cell la-axis-side",
          highlightRow ? "la-axis-highlight-row" : "",
        ].join(" ")}
        style={{ animationDelay: `${rowDelay}s` }}
      >
        {showGrid ? sideNumber : ""}
      </div>

      {Array.from({ length: 10 }, (_, col) => {
        const squareId = row * 10 + col;
        const isUser = userSet.has(squareId);
        const isWinning = winningSquareId === squareId;
        const isSelected = selectedSquareId === squareId;
        const displayNum = getSquareDisplayNumber(squareId, innerNumbers);
        const numberDelay = squareId * 0.018;
        const showNum = showNumbers && (fullyRevealed || !isUser || showOwned);

        return (
          <button
            key={squareId}
            type="button"
            onClick={() => isUser && onSquareClick(squareId)}
            disabled={!isUser}
            className={[
              "la-square-cell",
              isWinning ? "la-square-winning" : "",
              isUser && showOwned ? "la-square-owned" : "",
              !isUser ? "la-square-empty" : "",
              isSelected ? "la-square-selected" : "",
              signatureActive && isWinning ? "la-square-signature-hit" : "",
              showNumbers && !showNum ? "la-square-hidden-num" : "",
            ].join(" ")}
            style={{ animationDelay: `${numberDelay}s` }}
            aria-label={
              isUser
                ? `Your square ${displayNum ?? squareId}${isWinning ? ", currently winning" : ""}`
                : `Square ${displayNum ?? squareId}`
            }
          >
            {showNum && isUser && (
              <span className="la-square-num">{displayNum ?? "•"}</span>
            )}
            {isWinning && fullyRevealed && <WinParticles active={isWinning} />}
            {isWinning && fullyRevealed && <span className="la-win-ripple" aria-hidden />}
          </button>
        );
      })}
    </>
  );
}
