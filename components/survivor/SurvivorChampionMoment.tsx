"use client";

import { useEffect, useState } from "react";
import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import type { SurvivorMode } from "@/lib/survivor/types";

export interface SurvivorChampionMomentProps {
  displayName: string;
  weeksSurvived: number;
  leagueName: string;
  leagueMode: SurvivorMode;
  shieldUsedWeek: number | null;
  onComplete: () => void;
}

export function championStorageKey(entryId: string): string {
  return `survivor-champion-seen:${entryId}`;
}

export default function SurvivorChampionMoment({
  displayName,
  weeksSurvived,
  leagueName,
  leagueMode,
  shieldUsedWeek,
  onComplete,
}: SurvivorChampionMomentProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [confettiKey, setConfettiKey] = useState(1);

  useEffect(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const ms = reduced ? 4500 : 6500;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [reduced, onComplete]);

  if (!visible) return null;

  const isTurbo = leagueMode === "turbo";

  return (
    <div
      className={`survivor-champion-overlay fixed inset-0 z-[100] flex items-center justify-center p-6 ${
        reduced ? "survivor-champion-overlay-reduced" : ""
      }`}
      role="alertdialog"
      aria-labelledby="champion-title"
      aria-describedby="champion-desc"
    >
      <ConfettiCelebration trigger={confettiKey} tier="large" />
      <div className="survivor-champion-backdrop absolute inset-0" aria-hidden />
      <div
        className={`relative text-center max-w-md survivor-champion-card ${
          reduced ? "" : "survivor-champion-card-animate"
        }`}
      >
        <p className="text-6xl mb-4 survivor-champion-emoji" aria-hidden>
          👑
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/90 mb-2 font-bold">
          {isTurbo ? "Turbo Sprint Champion" : "Season Champion"}
        </p>
        <h2
          id="champion-title"
          className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 survivor-champion-title"
        >
          {displayName.toUpperCase()}
        </h2>
        <p id="champion-desc" className="text-sm text-sb-muted mb-3">
          Last one standing in {leagueName}. {weeksSurvived} week
          {weeksSurvived === 1 ? "" : "s"} survived
          {shieldUsedWeek ? ` — Shield deployed Week ${shieldUsedWeek}` : " — Shield unused"}.
        </p>
        <p className="text-xs text-amber-400/90">
          Inducted into the Survivor X™ Hall of Fame — your legacy is permanent.
        </p>
      </div>
    </div>
  );
}
