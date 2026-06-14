"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

export interface SurvivorEliminationMomentProps {
  displayName: string;
  teamName: string;
  weekNumber: number;
  weeksSurvived: number;
  onComplete: () => void;
}

export function eliminationStorageKey(entryId: string, weekNumber: number): string {
  return `survivor-elim-seen:${entryId}:${weekNumber}`;
}

export default function SurvivorEliminationMoment({
  displayName,
  teamName,
  weekNumber,
  weeksSurvived,
  onComplete,
}: SurvivorEliminationMomentProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ms = reduced ? 2800 : 4200;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [reduced, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`survivor-elim-overlay fixed inset-0 z-[100] flex items-center justify-center p-6 ${
        reduced ? "survivor-elim-overlay-reduced" : ""
      }`}
      role="alertdialog"
      aria-labelledby="elim-title"
      aria-describedby="elim-desc"
    >
      <div className="survivor-elim-backdrop absolute inset-0" aria-hidden />
      <div
        className={`relative text-center max-w-md survivor-elim-card ${
          reduced ? "" : "survivor-elim-card-animate"
        }`}
      >
        <p className="text-5xl mb-4 survivor-elim-emoji" aria-hidden>
          💀
        </p>
        <h2 id="elim-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          ELIMINATED
        </h2>
        <p id="elim-desc" className="text-sm text-sb-muted mb-3">
          {teamName} fell in Week {weekNumber}. Your {weeksSurvived}-week run ends here, {displayName}.
        </p>
        <p className="text-xs text-amber-400/90">The season continues — jump back in below.</p>
      </div>
    </div>
  );
}
