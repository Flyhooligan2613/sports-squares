"use client";

import BoardFillProgress from "@/components/contest-center/BoardFillProgress";

interface BoardFillBarProps {
  fillPercent: number;
  remaining: number;
  total?: number;
}

export default function BoardFillBar({
  fillPercent,
  remaining,
  total = 100,
}: BoardFillBarProps) {
  return (
    <BoardFillProgress
      fillPercent={fillPercent}
      totalSpots={total}
      remainingSpots={remaining}
      compact
      className="mt-2"
    />
  );
}
