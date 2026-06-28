"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="la-square-overlay fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm la-overlay-dim"
        onClick={onClose}
        aria-label="Close square detail"
      />

      <div className="la-square-detail-card relative w-full max-w-[400px] mx-4 mb-24 sm:mb-0 la-glass-card p-4 border border-blue-400/20 la-detail-enter">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex items-start gap-3">
          <div
            className={[
              "la-detail-square-preview shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-2",
              isWinning
                ? "border-amber-400/80 bg-amber-500/20 text-amber-100 la-square-winning"
                : "border-blue-400/40 bg-blue-500/15 text-blue-100 la-square-owned",
            ].join(" ")}
          >
            {square.displayNumber}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-lg font-bold">Square #{square.displayNumber}</p>
            <p className="text-[11px] text-sb-muted mt-0.5">
              Row {squareRow + 1} · Col {squareCol + 1} · Grid {square.squareId + 1}
            </p>
            {isWinning && (
              <p className="text-xs font-semibold text-amber-400 mt-1">
                🏆 Currently Winning
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <DetailCell label="Live Score" value={`${awayScore} – ${homeScore}`} />
          <DetailCell label="Quarter" value={`Q${quarter} · ${clock}`} />
          <DetailCell
            label="Potential Prize"
            value={`$${square.potentialPayout.toLocaleString()}`}
            highlight
          />
          <DetailCell
            label="Contest Position"
            value={isWinning ? "Leading" : "In play"}
          />
          <DetailCell
            label="Historical Win Rate"
            value={`${(square.historicalWinRate * 100).toFixed(1)}%`}
          />
          <DetailCell
            label="Quarters Won"
            value={
              square.quartersWon.length > 0
                ? square.quartersWon.map((q) => `Q${q}`).join(", ")
                : "—"
            }
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
    <div className="p-2 rounded-lg bg-black/25 border border-white/[0.04]">
      <p className="text-[10px] text-sb-muted uppercase tracking-wider">{label}</p>
      <p
        className={[
          "font-semibold mt-0.5 tabular-nums",
          highlight ? "text-sb-gold" : "text-white/90",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
