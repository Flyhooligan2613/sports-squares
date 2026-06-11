"use client";

import { useEffect, useRef, useState } from "react";
import { shuffleDigits } from "@/lib/utils";

const DRAW_DURATION_MS = 3000;
const TICK_MS = 80;
const REVEAL_STAGGER_MS = 120;

interface NumberDrawModalProps {
  isOpen: boolean;
  homeTeam: string;
  awayTeam: string;
  presetTop?: number[];
  presetSide?: number[];
  onNumbersReady: (topNumbers: number[], sideNumbers: number[]) => void;
  onComplete: () => void;
}

function randomRow(): number[] {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
}

export default function NumberDrawModal({
  isOpen,
  homeTeam,
  awayTeam,
  presetTop,
  presetSide,
  onNumbersReady,
  onComplete,
}: NumberDrawModalProps) {
  const [phase, setPhase] = useState<"drawing" | "reveal" | "done">("drawing");
  const [displayTop, setDisplayTop] = useState<number[]>(randomRow);
  const [displaySide, setDisplaySide] = useState<number[]>(randomRow);
  const [revealedCount, setRevealedCount] = useState(0);
  const finalTop = useRef<number[]>([]);
  const finalSide = useRef<number[]>([]);
  const completed = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    completed.current = false;
    const hasPreset =
      presetTop?.length === 10 && presetSide?.length === 10;
    const top = hasPreset ? presetTop! : shuffleDigits();
    const side = hasPreset ? presetSide! : shuffleDigits();
    finalTop.current = top;
    finalSide.current = side;

    if (!hasPreset) {
      onNumbersReady(top, side);
    }

    setPhase("drawing");
    setRevealedCount(0);
    setDisplayTop(randomRow());
    setDisplaySide(randomRow());

    const tick = setInterval(() => {
      setDisplayTop(randomRow());
      setDisplaySide(randomRow());
    }, TICK_MS);

    const drawTimer = setTimeout(() => {
      clearInterval(tick);
      setDisplayTop(finalTop.current);
      setDisplaySide(finalSide.current);
      setPhase("reveal");
      setRevealedCount(0);
    }, DRAW_DURATION_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(drawTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (phase !== "reveal") return;

    if (revealedCount >= 20) {
      setPhase("done");
      const timer = setTimeout(() => {
        if (!completed.current) {
          completed.current = true;
          onComplete();
        }
      }, 600);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, REVEAL_STAGGER_MS);

    return () => clearTimeout(timer);
  }, [phase, revealedCount, onComplete]);

  if (!isOpen) return null;

  const topRevealed = Math.min(revealedCount, 10);
  const sideRevealed = Math.max(0, revealedCount - 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md number-draw-backdrop" />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto number-draw-modal">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-sm number-draw-glow" />
        <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 number-draw-scanline" />

          <div className="text-center mb-8">
            {phase === "drawing" && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 number-draw-pulse">
                Drawing Numbers...
              </h2>
            )}
            {phase === "reveal" && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                Numbers Revealed!
              </h2>
            )}
            {phase === "done" && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-green-400">
                Board Ready!
              </h2>
            )}
            <p className="text-slate-500 text-sm mt-2">
              {phase === "drawing"
                ? "Shuffling the digits..."
                : "Your board numbers are set"}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3 text-center">
                {homeTeam} &mdash; Top
              </p>
              <div className="flex justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-1">
                {displayTop.map((digit, i) => (
                  <DigitCell
                    key={`top-${i}`}
                    digit={digit}
                    revealed={phase !== "drawing" && i < topRevealed}
                    spinning={phase === "drawing"}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3 text-center">
                {awayTeam} &mdash; Side
              </p>
              <div className="flex justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-1">
                {displaySide.map((digit, i) => (
                  <DigitCell
                    key={`side-${i}`}
                    digit={digit}
                    revealed={phase !== "drawing" && i < sideRevealed}
                    spinning={phase === "drawing"}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            </div>
          </div>

          {phase === "drawing" && (
            <div className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full number-draw-progress" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DigitCell({
  digit,
  revealed,
  spinning,
  delay,
}: {
  digit: number;
  revealed: boolean;
  spinning: boolean;
  delay: number;
}) {
  return (
    <div
      className={[
        "w-7 h-9 sm:w-10 sm:h-12 rounded-lg flex items-center justify-center font-mono text-base sm:text-xl font-bold border transition-all duration-300",
        spinning
          ? "bg-slate-800 border-slate-600 text-slate-300 digit-spin"
          : revealed
            ? "bg-indigo-600 border-indigo-400 text-white scale-100 digit-reveal"
            : "bg-slate-800 border-slate-700 text-slate-600 scale-95",
      ].join(" ")}
      style={{ animationDelay: `${delay}s` }}
    >
      {digit}
    </div>
  );
}
