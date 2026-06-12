"use client";

import Link from "next/link";
import { ChevronRight, Grid3X3 } from "lucide-react";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import BoardFillBar from "@/components/marketplace/BoardFillBar";
import StatusBadge from "@/components/ui/StatusBadge";
import type { PoolStatus } from "@/lib/types";

interface GameBoardRowProps {
  poolId: string;
  boardIndex: number;
  status: PoolStatus;
  remaining: number;
  costPerSquare: number;
  prizePoolLabel: string;
  tierLabel?: string;
  isCurrentOpen: boolean;
}

export default function GameBoardRow({
  poolId,
  boardIndex,
  status,
  remaining,
  costPerSquare,
  prizePoolLabel,
  tierLabel,
  isCurrentOpen,
}: GameBoardRowProps) {
  const open = status === "open" && remaining > 0;
  const fillPercent = Math.round(((100 - remaining) / 100) * 100);

  return (
    <div
      className={[
        "marketplace-board-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border",
        isCurrentOpen
          ? "bg-sb-purple/10 border-sb-glow/30"
          : "bg-sb-bg/50 border-white/[0.06]",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-white font-semibold">Board #{boardIndex}</span>
          {tierLabel ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2 py-0.5">
              {tierLabel}
            </span>
          ) : null}
          <PoolStatusBadge status={status} />
          {isCurrentOpen ? (
            <StatusBadge variant="open" pulse>
              Open Now
            </StatusBadge>
          ) : null}
        </div>
        <p className="text-sm text-sb-muted inline-flex items-center gap-1.5 flex-wrap">
          <Grid3X3 className="w-3.5 h-3.5" />
          {open ? `${remaining} squares left` : `${100 - remaining}/100 sold`}
          {costPerSquare > 0 && (
            <>
              <span className="text-sb-muted/50">·</span>
              ${costPerSquare.toFixed(2)}/sq
            </>
          )}
          {prizePoolLabel !== "—" && (
            <>
              <span className="text-sb-muted/50">·</span>
              <span className="text-sb-gold font-semibold">{prizePoolLabel} pool</span>
            </>
          )}
        </p>
        <BoardFillBar fillPercent={fillPercent} remaining={remaining} />
      </div>

      <Link
        href={`/pool/${poolId}`}
        className={[
          "sb-btn-primary inline-flex items-center justify-center gap-1 min-h-[44px] px-5 rounded-xl text-sm font-semibold shrink-0",
          open ? "" : "opacity-50 pointer-events-none",
        ].join(" ")}
        aria-disabled={!open}
      >
        {open ? "Play this board" : "Closed"}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
