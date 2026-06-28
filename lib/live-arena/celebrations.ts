import type { WinCelebrationKind, CelebrationPhase } from "./types";

export type ActiveCelebrationPhase = Exclude<CelebrationPhase, "idle">;

/** Phase durations (ms) — total ~6.5s full celebration */
export const CELEBRATION_PHASE_MS: Record<ActiveCelebrationPhase, number> = {
  anticipation: 1400,
  "pool-highlight": 1600,
  spin: 2000,
  burst: 700,
  banner: 2800,
  complete: 400,
};

export const CELEBRATION_TOTAL_MS = Object.values(
  CELEBRATION_PHASE_MS
).reduce((a, b) => a + b, 0);

/** Ordered phases per celebration kind */
export function getCelebrationPhaseSequence(
  kind: WinCelebrationKind
): ActiveCelebrationPhase[] {
  const base: ActiveCelebrationPhase[] = [
    "anticipation",
    "spin",
    "burst",
    "banner",
    "complete",
  ];
  if (kind === "quarter-pool") {
    return ["anticipation", "pool-highlight", "spin", "burst", "banner", "complete"];
  }
  return base;
}

export function resolveCelebrationKind(
  userOwnsWinningSquare: boolean,
  forced?: WinCelebrationKind
): WinCelebrationKind {
  if (forced) return forced;
  return userOwnsWinningSquare ? "user-square" : "mystery-square";
}

export interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

const CONFETTI_COLORS = [
  "#f6c453",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#fff",
];

/** Lightweight DOM confetti — GPU-friendly transform/opacity only */
export function generateConfetti(count: number, mobile = false): ConfettiPiece[] {
  const n = mobile ? Math.min(count, 35) : Math.min(count, 55);
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 30,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
    rotation: Math.random() * 360,
    scale: 0.6 + Math.random() * 0.8,
    delay: Math.random() * 0.35,
  }));
}

export const MYSTERY_WINNER_MASKS = [
  "Player ***47",
  "Player ***12",
  "Player ***89",
  "Competitor ***23",
];

export function pickMysteryWinner(seed: number): string {
  return MYSTERY_WINNER_MASKS[seed % MYSTERY_WINNER_MASKS.length]!;
}

export function getCelebrationBannerCopy(
  kind: WinCelebrationKind,
  maskedWinner?: string
): { title: string; subtitle: string } {
  switch (kind) {
    case "user-square":
      return {
        title: "🏆 YOU WON!",
        subtitle: "Square prize unlocked",
      };
    case "mystery-square":
      return {
        title: "🎉 SQUARE WON",
        subtitle: maskedWinner ?? "Mystery Winner",
      };
    case "quarter-pool":
      return {
        title: "🏆 QUARTER POOL WIN!",
        subtitle: "Line prize + square bonus",
      };
  }
}

export function isReducedMotionPreferred(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
