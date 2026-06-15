"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { Button } from "@/components/ui/Button";
import type { FillingFastBoard } from "@/lib/actionCenter/types";
import { JOIN_THE_CONTEST } from "@/lib/platform/legacy/competitiveLanguage";

interface BoardsFillingFastProps {
  boards: FillingFastBoard[];
}

export default function BoardsFillingFast({ boards }: BoardsFillingFastProps) {
  return (
    <section>
      <h2 className="ac-section-title">Boards Filling Fast</h2>
      {boards.length === 0 ? (
        <LandingGlassCard className="p-6">
          <SectionEmptyState
            emoji="📋"
            title="Boards are opening"
            description="Open boards appear here as they fill — grab squares before they're gone."
            actionLabel="Browse Games"
            actionHref="/games/nfl"
            compact
          />
        </LandingGlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {boards.map((board) => (
            <LandingGlassCard
              key={board.poolId}
              glow={board.fillPercent >= 95}
              className="ac-filling-card p-4 admin-stat-enter"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs font-bold text-sb-gold mb-1">🔥 Filling Fast</p>
                  <p className="text-base font-bold text-white">
                    {board.awayTeam} vs {board.homeTeam}
                  </p>
                  <p className="text-xs text-sb-muted mt-0.5">
                    Board #{board.boardIndex}
                  </p>
                </div>
                <p className="text-2xl font-bold text-sb-gold tabular-nums">
                  {board.fillPercent}%
                </p>
              </div>
              <div className="ac-fill-bar mb-3">
                <span
                  className="ac-fill-bar-fill"
                  style={{ width: `${board.fillPercent}%` }}
                />
              </div>
              <p className="text-sm text-white font-semibold mb-3">
                Only {board.squaresRemaining} square
                {board.squaresRemaining === 1 ? "" : "s"} left
              </p>
              <Link href={`/pool/${board.poolId}`}>
                <Button size="sm" className="w-full ac-btn-play">
                  {JOIN_THE_CONTEST}
                </Button>
              </Link>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </section>
  );
}
