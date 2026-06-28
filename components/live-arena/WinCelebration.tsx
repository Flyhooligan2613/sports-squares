"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import AnimatedCurrency from "@/components/ui/AnimatedCurrency";
import {
  generateConfetti,
  getCelebrationBannerCopy,
  isReducedMotionPreferred,
} from "@/lib/live-arena/celebrations";
import type { CelebrationPhase, WinCelebrationKind } from "@/lib/live-arena/types";

interface WinCelebrationProps {
  active: boolean;
  kind: WinCelebrationKind | null;
  phase: CelebrationPhase;
  payout: number;
  maskedWinner?: string;
  /** Grid-relative center for confetti origin (0–100%) */
  confettiOrigin?: { x: number; y: number };
}

export default function WinCelebration({
  active,
  kind,
  phase,
  payout,
  maskedWinner,
  confettiOrigin = { x: 50, y: 45 },
}: WinCelebrationProps) {
  const [mobile, setMobile] = useState(false);
  const reducedMotion = useMemo(() => isReducedMotionPreferred(), []);

  useEffect(() => {
    setMobile(window.innerWidth < 640);
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const confetti = useMemo(
    () => (active && !reducedMotion ? generateConfetti(65, mobile) : []),
    [active, mobile, reducedMotion]
  );

  if (!active || !kind) return null;

  const showDim =
    phase === "anticipation" ||
    phase === "pool-highlight" ||
    phase === "spin" ||
    phase === "burst";
  const showConfetti =
    !reducedMotion && (phase === "burst" || phase === "banner");
  const showBanner = phase === "banner" || (reducedMotion && phase === "burst");
  const copy = getCelebrationBannerCopy(kind, maskedWinner);
  const isUserWin = kind === "user-square" || kind === "quarter-pool";

  return (
    <div
      className={[
        "la-win-celebration",
        `la-win-celebration--${kind}`,
        `la-win-celebration--phase-${phase}`,
        reducedMotion ? "la-win-celebration--reduced" : "",
      ].join(" ")}
      aria-live="polite"
      role="presentation"
    >
      {showDim && <div className="la-win-celebration__dim" aria-hidden />}

      {showConfetti && (
        <div
          className="la-win-celebration__confetti"
          style={
            {
              "--la-cx": `${confettiOrigin.x}%`,
              "--la-cy": `${confettiOrigin.y}%`,
            } as CSSProperties
          }
          aria-hidden
        >
          {confetti.map((p) => (
            <span
              key={p.id}
              className="la-confetti-piece"
              style={
                {
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  "--la-confetti-color": p.color,
                  "--la-confetti-rot": `${p.rotation}deg`,
                  "--la-confetti-scale": p.scale,
                  animationDelay: `${p.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {phase === "burst" && !reducedMotion && (
        <div className="la-win-celebration__flash" aria-hidden />
      )}

      {showBanner && (
        <div
          className={[
            "la-win-celebration__banner la-glass-card",
            isUserWin ? "la-win-celebration__banner--gold" : "",
          ].join(" ")}
          role="status"
        >
          <p className="la-win-celebration__title">{copy.title}</p>
          <p className="la-win-celebration__subtitle">{copy.subtitle}</p>
          {isUserWin && (
            <p className="la-win-celebration__payout tabular-nums">
              <AnimatedCurrency amount={payout} active />
            </p>
          )}
          {kind === "mystery-square" && (
            <p className="la-win-celebration__mystery-hint">
              Your squares are still in play
            </p>
          )}
        </div>
      )}
    </div>
  );
}
