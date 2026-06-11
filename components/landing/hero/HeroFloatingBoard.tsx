"use client";

import type { Pool } from "@/lib/types";

interface HeroFloatingBoardProps {
  pool?: Pool | null;
}

const PLACEHOLDER_NUMBERS = [3, 7, 0, 4, 9, 1, 6, 2, 8, 5];

export default function HeroFloatingBoard({ pool }: HeroFloatingBoardProps) {
  const topNumbers =
    pool?.topNumbers?.length === 10 ? pool.topNumbers : PLACEHOLDER_NUMBERS;
  const sideNumbers =
    pool?.sideNumbers?.length === 10 ? pool.sideNumbers : PLACEHOLDER_NUMBERS;
  const squares = pool?.squares ?? [];

  const cells: { claimed: boolean; highlight: boolean }[] = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const idx = row * 10 + col;
      const square = squares[idx];
      cells.push({
        claimed: square?.claimed ?? (idx % 7 === 0 || idx % 11 === 3),
        highlight: idx % 13 === 5,
      });
    }
  }

  return (
    <div className="hero-board-stage sb-glow-board">
      <div className="hero-board-glow hero-board-glow-v2" aria-hidden />
      <div className="hero-board-glow-floor" aria-hidden />
      <div className="hero-board-reflection hero-board-reflection-v2" aria-hidden />

      <div className="hero-board-wrap hero-board-wrap-v2">
        <div className="hero-board-3d hero-board-3d-v2">
          <div className="hero-board-frame hero-board-frame-v2">
            <div className="hero-board-corner" aria-hidden />

            {topNumbers.map((n, i) => (
              <div
                key={`top-${i}`}
                className="hero-board-axis hero-board-axis-top"
                style={{ gridColumn: i + 2, gridRow: 1 }}
              >
                {n}
              </div>
            ))}

            {sideNumbers.map((n, row) => (
              <div
                key={`side-${row}`}
                className="hero-board-axis hero-board-axis-side"
                style={{ gridColumn: 1, gridRow: row + 2 }}
              >
                {n}
              </div>
            ))}

            {cells.map((cell, idx) => {
              const row = Math.floor(idx / 10);
              const col = idx % 10;
              return (
                <div
                  key={`cell-${idx}`}
                  className={[
                    "hero-board-cell",
                    cell.claimed ? "hero-board-cell-claimed" : "",
                    cell.highlight ? "hero-board-cell-highlight" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ gridColumn: col + 2, gridRow: row + 2 }}
                />
              );
            })}
          </div>
          <div className="hero-board-edge hero-board-edge-v2" aria-hidden />
        </div>
      </div>
    </div>
  );
}
