"use client";

interface BoardFillBarProps {
  fillPercent: number;
  remaining: number;
}

export default function BoardFillBar({ fillPercent, remaining }: BoardFillBarProps) {
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-sb-muted">
        <span>{fillPercent}% filled</span>
        <span>{remaining} left</span>
      </div>
      <div className="game-board-fill-track" aria-hidden>
        <span
          className="game-board-fill-bar"
          style={{ width: `${Math.min(fillPercent, 100)}%` }}
        />
      </div>
    </div>
  );
}
