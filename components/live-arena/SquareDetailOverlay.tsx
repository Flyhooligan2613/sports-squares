"use client";

import type { UserSquareMeta } from "@/lib/live-arena/types";

interface SquareDetailOverlayProps {
  square: UserSquareMeta;
  isWinning: boolean;
  awayScore: number;
  homeScore: number;
  quarter: number;
  clock: string;
  onClose: () => void;
}

export default function SquareDetailOverlay({
  square,
  isWinning,
  awayScore,
  homeScore,
  quarter,
  clock,
  onClose,
}: SquareDetailOverlayProps) {
  const squareRow = Math.floor(square.squareId / 10);
  const squareCol = square.squareId % 10;

  return (
    <div className="la-square-detail-float" role="dialog" aria-label="Square details">
      <div className="la-square-detail-card la-glass-card la-ui-breathe">
        <button
          type="button"
          onClick={onClose}
          className="la-square-detail-close"
          aria-label="Close"
        >
          ×
        </button>

        <div className="la-square-detail-hero">
          <div
            className={[
              "la-detail-square-preview",
              isWinning ? "la-detail-square-preview--winning" : "",
            ].join(" ")}
          >
            {square.displayNumber}
          </div>
          <div className="la-square-detail-copy">
            <p className="la-square-detail-title">Square #{square.displayNumber}</p>
            {isWinning && (
              <p className="la-square-detail-winning">🏆 Currently Winning</p>
            )}
            <p className="la-square-detail-meta">
              Row {squareRow + 1} · Col {squareCol + 1}
            </p>
          </div>
        </div>

        <div className="la-square-detail-stats">
          <DetailCell label="Live Score" value={`${awayScore} – ${homeScore}`} />
          <DetailCell label="Quarter" value={`Q${quarter} · ${clock}`} />
          <DetailCell
            label="Potential Prize"
            value={`$${square.potentialPayout.toLocaleString()}`}
            highlight
          />
          <DetailCell
            label="Position"
            value={isWinning ? "Leading" : "In play"}
          />
        </div>
      </div>
    </div>
  );
}

function DetailCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="la-square-detail-stat">
      <p className="la-square-detail-stat-label">{label}</p>
      <p
        className={[
          "la-square-detail-stat-value",
          highlight ? "la-square-detail-stat-value--gold" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
