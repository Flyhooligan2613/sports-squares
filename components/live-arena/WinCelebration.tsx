"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import AnimatedCurrency from "@/components/ui/AnimatedCurrency";
import {
  generateConfetti,
  getCelebrationBannerCopy,
  getSportBallVisual,
  isReducedMotionPreferred,
  measureWinningSquareOrigin,
} from "@/lib/live-arena/celebrations";
import type {
  CelebrationPhase,
  ContestSport,
  WinCelebrationKind,
} from "@/lib/live-arena/types";

interface WinCelebrationProps {
  active: boolean;
  kind: WinCelebrationKind | null;
  phase: CelebrationPhase;
  payout: number;
  maskedWinner?: string;
  sport?: ContestSport;
  displayNumber?: string | null;
  /** Grid-relative center for confetti origin (0–100%) */
  confettiOrigin?: { x: number; y: number };
}

interface HeroOrigin {
  x: number;
  y: number;
  size: number;
}

function CinematicWinSquare({
  phase,
  displayNumber,
  payout,
  showPayout,
  origin,
  isUserWin,
}: {
  phase: CelebrationPhase;
  displayNumber: string | null | undefined;
  payout: number;
  showPayout: boolean;
  origin: HeroOrigin;
  isUserWin: boolean;
}) {
  const cinematic =
    phase === "spin" || phase === "burst" || phase === "banner";

  if (!cinematic) return null;

  const heroStyle = {
    "--la-hero-x": `${origin.x}px`,
    "--la-hero-y": `${origin.y}px`,
    "--la-hero-size": `${origin.size}px`,
  } as CSSProperties;

  return (
    <div
      className={[
        "la-cinematic-hero",
        `la-cinematic-hero--${phase}`,
        isUserWin ? "la-cinematic-hero--gold" : "",
      ].join(" ")}
      style={heroStyle}
      aria-hidden
    >
      <div className="la-cinematic-hero__motion">
        <div className="la-cinematic-hero__cube">
          <div className="la-cinematic-hero__face la-cinematic-hero__face--front">
            <span className="la-cinematic-hero__num">
              {displayNumber ?? "★"}
            </span>
          </div>
          <div className="la-cinematic-hero__face la-cinematic-hero__face--back">
            SB
          </div>
          <div className="la-cinematic-hero__face la-cinematic-hero__face--side">
            🏆
          </div>
        </div>

        {phase === "spin" && (
          <>
            <div className="la-cinematic-hero__energy-ring" />
            <div className="la-cinematic-hero__energy-ring la-cinematic-hero__energy-ring--2" />
          </>
        )}

        {phase === "burst" && (
          <>
            <div className="la-cinematic-hero__particles" />
            <div className="la-cinematic-hero__smoke" />
            <div className="la-cinematic-hero__flash" />
          </>
        )}
      </div>

      {showPayout && (phase === "burst" || phase === "banner") && (
        <div
          className={[
            "la-cinematic-hero__payout",
            phase === "burst" ? "la-cinematic-hero__payout--burst" : "",
          ].join(" ")}
        >
          <span className="la-cinematic-hero__payout-label">Prize</span>
          <span className="la-cinematic-hero__payout-amount tabular-nums">
            <AnimatedCurrency amount={payout} active />
          </span>
        </div>
      )}
    </div>
  );
}

function SportBallFlyby({
  sport,
  phase,
}: {
  sport: ContestSport;
  phase: CelebrationPhase;
}) {
  const visual = getSportBallVisual(sport);
  const show =
    phase === "anticipation" ||
    phase === "pool-highlight" ||
    phase === "spin";

  if (!show) return null;

  return (
    <div
      className={[
        "la-sport-ball-flyby",
        `la-sport-ball-flyby--${visual.variant}`,
        phase === "spin" ? "la-sport-ball-flyby--late" : "",
      ].join(" ")}
      aria-hidden
    >
      <span className="la-sport-ball-flyby__ball">{visual.emoji}</span>
      <span className="la-sport-ball-flyby__trail" />
    </div>
  );
}

export default function WinCelebration({
  active,
  kind,
  phase,
  payout,
  maskedWinner,
  sport = "nfl",
  displayNumber,
  confettiOrigin = { x: 50, y: 45 },
}: WinCelebrationProps) {
  const [mobile, setMobile] = useState(false);
  const [heroOrigin, setHeroOrigin] = useState<HeroOrigin | null>(null);
  const reducedMotion = useMemo(() => isReducedMotionPreferred(), []);

  useEffect(() => {
    setMobile(window.innerWidth < 640);
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!active || reducedMotion) {
      setHeroOrigin(null);
      return;
    }
    if (
      phase === "spin" ||
      phase === "burst" ||
      phase === "banner" ||
      phase === "anticipation"
    ) {
      const measure = () => {
        const origin = measureWinningSquareOrigin();
        if (origin) setHeroOrigin(origin);
      };
      measure();
      const raf = window.requestAnimationFrame(measure);
      return () => window.cancelAnimationFrame(raf);
    }
  }, [active, phase, reducedMotion]);

  const confetti = useMemo(
    () =>
      active && !reducedMotion
        ? generateConfetti(phase === "burst" ? 85 : 65, mobile)
        : [],
    [active, mobile, reducedMotion, phase]
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
  const showHeroPayout = isUserWin && payout > 0;

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

      {!reducedMotion && (
        <SportBallFlyby sport={sport} phase={phase} />
      )}

      {!reducedMotion && heroOrigin && (
        <CinematicWinSquare
          phase={phase}
          displayNumber={displayNumber}
          payout={payout}
          showPayout={showHeroPayout}
          origin={heroOrigin}
          isUserWin={isUserWin}
        />
      )}

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
