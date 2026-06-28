"use client";

import { useMemo, type CSSProperties } from "react";
import AnimatedCurrency from "@/components/ui/AnimatedCurrency";
import { getSquareDisplayNumber } from "@/lib/engines/squareDisplay";
import { generateConfetti } from "@/lib/live-arena/celebrations";
import type { WinningSquareMatch } from "@/lib/live-arena/squareUtils";
import type {
  BoardRevealPhase,
  CelebrationPhase,
  LiveContest,
  WinCelebrationKind,
} from "@/lib/live-arena/types";

interface LiveArenaBoardProps {
  contest: LiveContest;
  userSquareIds: number[];
  winningSquareId: number | null;
  winningMatch: WinningSquareMatch | null;
  selectedSquareId: number | null;
  revealPhase: BoardRevealPhase;
  zoomed: boolean;
  signatureActive: boolean;
  winPathActive?: boolean;
  illuminateWinning?: boolean;
  boardReacting: boolean;
  boardBreathing?: boolean;
  boardTension?: boolean;
  celebrationPhase?: CelebrationPhase;
  celebrationKind?: WinCelebrationKind | null;
  poolLine?: "row" | "col" | null;
  closeSquareIds?: number[];
  winPayout?: number;
  showWinPayout?: boolean;
  onSquareClick: (squareId: number) => void;
}

function WinParticles({ active, intense }: { active: boolean; intense?: boolean }) {
  if (!active) return null;
  const count = intense ? 16 : 12;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
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

function SquareStar({ variant }: { variant: "winning" | "highlight" }) {
  return (
    <span
      className={`la-square-star la-square-star--${variant}`}
      aria-hidden
    >
      ★
    </span>
  );
}

function CellConfetti({ active }: { active: boolean }) {
  const pieces = useMemo(
    () => (active ? generateConfetti(14, true) : []),
    [active]
  );
  if (!active) return null;
  return (
    <div className="la-cell-confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="la-cell-confetti-piece"
          style={
            {
              left: `${20 + p.x * 0.6}%`,
              top: `${15 + p.y * 0.5}%`,
              "--la-confetti-color": p.color,
              "--la-confetti-rot": `${p.rotation}deg`,
              animationDelay: `${p.delay}s`,
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
  winPathActive = false,
  illuminateWinning = false,
  boardReacting,
  boardBreathing = false,
  boardTension = false,
  celebrationPhase = "idle",
  celebrationKind = null,
  poolLine = null,
  closeSquareIds = [],
  winPayout = 0,
  showWinPayout = false,
  onSquareClick,
}: LiveArenaBoardProps) {
  const { topNumbers, sideNumbers, innerNumbers, homeTeam, awayTeam } = contest;
  const userSet = useMemo(() => new Set(userSquareIds), [userSquareIds]);
  const closeSet = useMemo(() => new Set(closeSquareIds), [closeSquareIds]);
  const showGrid = revealPhase !== "hidden";
  const showNumbers =
    revealPhase === "numbers" ||
    revealPhase === "owned" ||
    revealPhase === "complete";
  const showOwned = revealPhase === "owned" || revealPhase === "complete";
  const fullyRevealed = revealPhase === "complete";

  const rowIdx = winningMatch?.row ?? -1;
  const colIdx = winningMatch?.col ?? -1;

  const focusRow =
    selectedSquareId != null ? Math.floor(selectedSquareId / 10) : 0;
  const focusCol = selectedSquareId != null ? selectedSquareId % 10 : 0;

  const celebrating =
    celebrationPhase !== "idle" && celebrationPhase !== "complete";
  const spinPhase = celebrationPhase === "spin";
  const burstPhase = celebrationPhase === "burst" || celebrationPhase === "banner";
  const poolHighlight = celebrationPhase === "pool-highlight";

  return (
    <div className="la-board-stage w-full mx-auto">
      <div
        className={[
          "la-board-container la-board-depth",
          zoomed ? "la-board-zoom" : "",
          boardReacting ? "la-board-react" : "",
          boardBreathing ? "la-board-breathing" : "",
          boardTension ? "la-board-tension" : "",
          celebrating ? "la-board-celebrating" : "",
        ].join(" ")}
        style={
          zoomed
            ? ({
                "--la-focus-row": focusRow,
                "--la-focus-col": focusCol,
              } as CSSProperties)
            : undefined
        }
      >
        <p className="la-board-home-label">{homeTeam}</p>

        <div className="la-board-grid-wrap">
          <div
            className={[
              "la-board-grid",
              showGrid ? "la-board-grid--visible" : "",
              signatureActive || celebrating ? "la-board-grid--signature" : "",
              zoomed ? "la-board-grid--zoomed" : "",
              illuminateWinning ? "la-board-grid--illuminate" : "",
            ].join(" ")}
          >
            <div className="la-axis-cell la-axis-corner" aria-hidden />
            {topNumbers.map((n, i) => (
              <div
                key={`top-${i}`}
                className={[
                  "la-axis-cell la-axis-top",
                  winPathActive && colIdx === i ? "la-win-path-origin-col" : "",
                  (signatureActive || poolHighlight) && colIdx === i
                    ? "la-axis-highlight-col"
                    : "",
                  poolHighlight && poolLine === "col" && colIdx === i
                    ? "la-axis-pool-sweep"
                    : "",
                ].join(" ")}
                style={{ animationDelay: `${0.04 + i * 0.035}s` }}
              >
                {showGrid ? n : ""}
              </div>
            ))}

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
                closeSet={closeSet}
                innerNumbers={innerNumbers}
                winningSquareId={winningSquareId}
                selectedSquareId={selectedSquareId}
                signatureActive={signatureActive || celebrating}
                highlightRow={
                  (signatureActive || poolHighlight) && rowIdx === row
                }
                winPathOriginRow={winPathActive && rowIdx === row}
                poolHighlight={poolHighlight}
                poolLine={poolLine}
                colIdx={colIdx}
                spinPhase={spinPhase}
                burstPhase={burstPhase}
                celebrationKind={celebrationKind}
                winPayout={winPayout}
                showWinPayout={showWinPayout}
                onSquareClick={onSquareClick}
              />
            ))}

            {(winPathActive || signatureActive || celebrationPhase === "anticipation") &&
              winningMatch && (
                <>
                  <div
                    className={[
                      "la-win-path-line la-win-path-line--h",
                      signatureActive ? "la-win-path-line--dramatic" : "",
                    ].join(" ")}
                    style={{ "--la-row": rowIdx, "--la-col": colIdx } as CSSProperties}
                    aria-hidden
                  />
                  <div
                    className={[
                      "la-win-path-line la-win-path-line--v",
                      signatureActive ? "la-win-path-line--dramatic" : "",
                    ].join(" ")}
                    style={{ "--la-row": rowIdx, "--la-col": colIdx } as CSSProperties}
                    aria-hidden
                  />
                  <div
                    className={[
                      "la-win-path-intersect",
                      illuminateWinning ? "la-win-path-intersect--illuminate" : "",
                      signatureActive ? "la-win-path-intersect--dramatic" : "",
                    ].join(" ")}
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

            {poolHighlight && poolLine && winningMatch && (
              <div
                className={[
                  "la-pool-line-sweep",
                  poolLine === "row"
                    ? "la-pool-line-sweep--row"
                    : "la-pool-line-sweep--col",
                ].join(" ")}
                style={
                  {
                    "--la-row": rowIdx,
                    "--la-col": colIdx,
                  } as CSSProperties
                }
                aria-hidden
              />
            )}
          </div>

          <p className="la-board-away-label">{awayTeam}</p>
        </div>

        {signatureActive && winningSquareId != null && !celebrating && (
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
  closeSet,
  innerNumbers,
  winningSquareId,
  selectedSquareId,
  signatureActive,
  highlightRow,
  winPathOriginRow,
  poolHighlight,
  poolLine,
  colIdx,
  spinPhase,
  burstPhase,
  celebrationKind,
  winPayout,
  showWinPayout,
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
  closeSet: Set<number>;
  innerNumbers: number[];
  winningSquareId: number | null;
  selectedSquareId: number | null;
  signatureActive: boolean;
  highlightRow: boolean;
  winPathOriginRow: boolean;
  poolHighlight: boolean;
  poolLine: "row" | "col" | null;
  colIdx: number;
  spinPhase: boolean;
  burstPhase: boolean;
  celebrationKind: WinCelebrationKind | null;
  winPayout: number;
  showWinPayout: boolean;
  onSquareClick: (id: number) => void;
}) {
  return (
    <>
      <div
        className={[
          "la-axis-cell la-axis-side",
          winPathOriginRow ? "la-win-path-origin-row" : "",
          highlightRow ? "la-axis-highlight-row" : "",
          poolHighlight && poolLine === "row" && highlightRow
            ? "la-axis-pool-sweep"
            : "",
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
        const isClose = closeSet.has(squareId);
        const displayNum = getSquareDisplayNumber(squareId, innerNumbers);
        const numberDelay = squareId * 0.018;

        return (
          <button
            key={squareId}
            type="button"
            onClick={() => isUser && onSquareClick(squareId)}
            disabled={!isUser}
            className={[
              "la-square-cell",
              isUser && showOwned ? "la-square-owned" : "",
              isWinning ? "la-square-winning" : "",
              isWinning && !isUser ? "la-square-highlight" : "",
              isWinning && isUser ? "la-square-winning-owned" : "",
              !isUser && !isWinning ? "la-square-empty" : "",
              isSelected ? "la-square-selected" : "",
              signatureActive && isWinning ? "la-square-signature-hit" : "",
              spinPhase && isWinning ? "la-square-prize-spin" : "",
              burstPhase && isWinning ? "la-square-prize-burst la-square-jump-out" : "",
              isClose && celebrationKind === "mystery-square"
                ? "la-square-close-pulse"
                : "",
              poolHighlight &&
              poolLine === "row" &&
              winningSquareId != null &&
              Math.floor(winningSquareId / 10) === row
                ? "la-square-pool-row"
                : "",
              poolHighlight &&
              poolLine === "col" &&
              winningSquareId != null &&
              winningSquareId % 10 === col
                ? "la-square-pool-col"
                : "",
            ].join(" ")}
            style={{ animationDelay: `${numberDelay}s` }}
            aria-label={
              isUser
                ? `Your square ${displayNum ?? squareId}${isWinning ? ", currently winning" : ""}`
                : `Square ${displayNum ?? squareId}`
            }
          >
            {showNumbers && (
              <span
                className={[
                  "la-square-num",
                  isUser ? "la-square-num--owned" : "la-square-num--spectator",
                ].join(" ")}
              >
                {displayNum ?? "•"}
              </span>
            )}
            {isWinning && showNumbers && (
              <SquareStar variant={isUser ? "winning" : "highlight"} />
            )}
            {isClose && !isWinning && showOwned && (
              <span className="la-square-close-ring" aria-hidden />
            )}
            {isWinning && showNumbers && (
              <WinParticles active={isWinning} intense={burstPhase} />
            )}
            {isWinning && showNumbers && (
              <>
                <span className="la-win-ripple" aria-hidden />
                {burstPhase && (
                  <>
                    <span className="la-burst-ring la-burst-ring--1" aria-hidden />
                    <span className="la-burst-ring la-burst-ring--2" aria-hidden />
                    <span className="la-burst-ring la-burst-ring--3" aria-hidden />
                    <CellConfetti active />
                  </>
                )}
              </>
            )}
            {isWinning && showWinPayout && winPayout > 0 && (
              <span className="la-square-prize-float" aria-live="polite">
                <AnimatedCurrency amount={winPayout} active />
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
