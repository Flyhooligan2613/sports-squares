"use client";

import { useEffect, useState } from "react";
import MicroCelebration from "@/components/alive/MicroCelebration";
import type { WinnerResult } from "@/lib/types";
import { formatSquareDisplayLabel } from "@/lib/engines/squareDisplay";

interface WinnerCardProps {
  result: WinnerResult;
  homeTeam: string;
  awayTeam: string;
  innerNumbers?: number[];
  showCelebration?: boolean;
}

export default function WinnerCard({
  result,
  homeTeam,
  awayTeam,
  innerNumbers,
  showCelebration = true,
}: WinnerCardProps) {
  const [celebrationTick, setCelebrationTick] = useState(0);

  useEffect(() => {
    if (!showCelebration) return;
    setCelebrationTick((n) => n + 1);
  }, [result.quarter, result.squareId, showCelebration]);

  return (
    <div className="winner-card relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      {showCelebration ? (
        <MicroCelebration
          trigger={celebrationTick}
          label={`${result.quarter} winner`}
          tier="medium"
        />
      ) : null}

      <div className="relative flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center winner-trophy-bounce">
          <TrophyIcon />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Quarter Winner
            </p>
            <p className="text-xl font-bold text-amber-100 mt-0.5">
              {result.ownerName}
            </p>
            {result.payoutAmount != null && result.payoutAmount > 0 ? (
              <p className="text-sm text-sb-gold font-semibold mt-1 tabular-nums">
                Prize ${result.payoutAmount.toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Quarter" value={result.quarter} />
            <Stat
              label="Winning Digits"
              value={`${result.awayDigit} × ${result.homeDigit}`}
              hint={`${awayTeam} × ${homeTeam}`}
            />
            <Stat
              label="Square"
              value={formatSquareDisplayLabel(result.squareId, innerNumbers)}
            />
            <Stat
              label="Score"
              value={`${result.awayScore}–${result.homeScore}`}
              hint={`${awayTeam}–${homeTeam}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
      {hint && <p className="text-[10px] text-slate-600 mt-0.5">{hint}</p>}
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg
      className="w-6 h-6 text-amber-400"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M5 3h14v2H5V3zm2 2v2c0 2.5 1.5 4.7 3.7 5.7L9 17H8v2h8v-2h-1l-.7-4.3c2.2-1 3.7-3.2 3.7-5.7V5h2V3H5v2h2zm2 0h8v2c0 2.2-1.4 4.1-3.5 4.8L12 11.5l-1.5-1.7C8.4 9.1 7 7.2 7 5z" />
    </svg>
  );
}
