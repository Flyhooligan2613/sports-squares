"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

export interface SurvivorShieldActivationProps {
  displayName: string;
  teamName: string;
  weekNumber: number;
  onComplete: () => void;
}

type Phase = "darken" | "shake" | "glow" | "crack" | "burst" | "message" | "done";

const PHASE_MS: Record<Exclude<Phase, "done">, number> = {
  darken: 600,
  shake: 800,
  glow: 900,
  crack: 700,
  burst: 900,
  message: 2200,
};

export default function SurvivorShieldActivation({
  displayName,
  teamName,
  weekNumber,
  onComplete,
}: SurvivorShieldActivationProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "message" : "darken");

  useEffect(() => {
    if (reduced) {
      const timer = window.setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 3500);
      return () => window.clearTimeout(timer);
    }

    const order: Exclude<Phase, "done">[] = [
      "darken",
      "shake",
      "glow",
      "crack",
      "burst",
      "message",
    ];
    let idx = 0;
    let timer = window.setTimeout(function tick() {
      idx += 1;
      if (idx >= order.length) {
        setPhase("done");
        onComplete();
        return;
      }
      setPhase(order[idx]!);
      timer = window.setTimeout(tick, PHASE_MS[order[idx - 1]!]);
    }, PHASE_MS[order[0]!]);

    return () => window.clearTimeout(timer);
  }, [reduced, onComplete]);

  if (phase === "done") return null;

  if (reduced) {
    return (
      <div
        className="survivor-shield-overlay survivor-shield-overlay-reduced fixed inset-0 z-[100] flex items-center justify-center p-6"
        role="alertdialog"
        aria-labelledby="shield-activation-title"
        aria-describedby="shield-activation-desc"
      >
        <div className="survivor-shield-panel max-w-md w-full text-center p-8 rounded-2xl border border-violet-400/40 bg-sb-bg/95">
          <p className="text-4xl mb-3" aria-hidden>
            🛡️
          </p>
          <h2 id="shield-activation-title" className="text-xl font-bold text-white mb-2">
            SURVIVOR SHIELD ACTIVATED
          </h2>
          <p id="shield-activation-desc" className="text-sm text-violet-200 mb-2">
            You survived another week.
          </p>
          <p className="text-xs text-sb-muted">
            {teamName} lost in Week {weekNumber} — your shield saved {displayName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`survivor-shield-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 survivor-shield-phase-${phase}`}
      role="alertdialog"
      aria-labelledby="shield-activation-title"
      aria-describedby="shield-activation-desc"
    >
      <div className="survivor-shield-backdrop absolute inset-0" aria-hidden />

      <div className="survivor-shield-stage relative flex flex-col items-center">
        <div
          className={`survivor-shield-icon ${
            phase === "shake" ? "survivor-shield-shake" : ""
          } ${phase === "glow" || phase === "crack" || phase === "burst" ? "survivor-shield-glow" : ""} ${
            phase === "crack" ? "survivor-shield-crack" : ""
          } ${phase === "burst" ? "survivor-shield-burst" : ""}`}
          aria-hidden
        >
          <div className="survivor-shield-glass">
            <span className="survivor-shield-emoji">🛡️</span>
          </div>
          {phase === "burst" ? (
            <div className="survivor-shield-fragments" aria-hidden />
          ) : null}
        </div>

        {(phase === "message" || phase === "burst") && (
          <div className="survivor-shield-copy mt-8 text-center max-w-sm survivor-shield-copy-enter">
            <h2 id="shield-activation-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              SURVIVOR SHIELD ACTIVATED
            </h2>
            <p id="shield-activation-desc" className="text-base text-violet-200 font-medium mb-2">
              You survived another week.
            </p>
            <p className="text-xs text-sb-muted">
              {teamName} · Week {weekNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function shieldActivationStorageKey(entryId: string, weekNumber: number): string {
  return `survivor-shield-seen:${entryId}:${weekNumber}`;
}
