"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

export interface SurvivorLifeLostMomentProps {
  displayName: string;
  teamName: string;
  weekNumber: number;
  livesRemaining: number;
  onComplete: () => void;
}

export function lifeLostStorageKey(entryId: string, weekNumber: number): string {
  return `survivor-life-lost-seen:${entryId}:${weekNumber}`;
}

export default function SurvivorLifeLostMoment({
  displayName,
  teamName,
  weekNumber,
  livesRemaining,
  onComplete,
}: SurvivorLifeLostMomentProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ms = reduced ? 2400 : 3600;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [reduced, onComplete]);

  if (!visible) return null;

  const lifeLabel = livesRemaining === 1 ? "1 life" : `${livesRemaining} lives`;

  return (
    <div
      className={`survivor-life-lost-overlay fixed inset-0 z-[100] flex items-center justify-center p-6 ${
        reduced ? "survivor-life-lost-overlay-reduced" : ""
      }`}
      role="alertdialog"
      aria-labelledby="life-lost-title"
      aria-describedby="life-lost-desc"
    >
      <div className="survivor-life-lost-backdrop absolute inset-0" aria-hidden />
      <div
        className={`relative text-center max-w-md survivor-life-lost-card ${
          reduced ? "" : "survivor-life-lost-card-animate"
        }`}
      >
        <p className="text-5xl mb-4 survivor-life-lost-emoji" aria-hidden>
          🔥
        </p>
        <h2
          id="life-lost-title"
          className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2"
        >
          LIFE LOST
        </h2>
        <p id="life-lost-desc" className="text-sm text-sb-muted mb-3">
          {teamName} fell in Week {weekNumber}. You&apos;re still alive, {displayName} —{" "}
          <span className="text-amber-400 font-semibold">{lifeLabel} remaining</span>.
        </p>
        <p className="text-xs text-amber-400/90">Double Life continues — pick again next week.</p>
      </div>
    </div>
  );
}
