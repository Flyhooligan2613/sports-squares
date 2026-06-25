"use client";

import type { CSSProperties } from "react";
import {
  boardFillIndicatorLabel,
  formatSquaresFilled,
  getBoardFillIndicator,
  resolveFilledCount,
} from "@/lib/contestCenter/boardFillUtils";

interface BoardFillProgressProps {
  fillPercent: number;
  totalSpots?: number;
  remainingSpots?: number;
  className?: string;
  accent?: string;
  compact?: boolean;
}

export default function BoardFillProgress({
  fillPercent,
  totalSpots = 100,
  remainingSpots,
  className = "",
  accent,
  compact = false,
}: BoardFillProgressProps) {
  const pct = Math.min(Math.max(fillPercent, 0), 100);
  const filled = resolveFilledCount(pct, totalSpots, remainingSpots);
  const indicator = getBoardFillIndicator(pct, remainingSpots);
  const style = accent ? ({ "--cc-accent": accent } as CSSProperties) : undefined;

  return (
    <div
      className={["cc-fill-wrap", compact ? "cc-fill-wrap-compact" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="progressbar"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={totalSpots}
      aria-label={formatSquaresFilled(filled, totalSpots)}
    >
      <div className="cc-fill-header">
        <span className="cc-fill-count">{formatSquaresFilled(filled, totalSpots)}</span>
        {indicator ? (
          <span className={`cc-fill-indicator cc-fill-indicator-${indicator}`}>
            {boardFillIndicatorLabel(indicator)}
          </span>
        ) : null}
      </div>
      <div className="cc-fill-bar">
        <span
          className="cc-fill-bar-fill cc-fill-bar-animated"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact ? (
        <span className="cc-fill-label">{pct}% of board filled</span>
      ) : null}
    </div>
  );
}
