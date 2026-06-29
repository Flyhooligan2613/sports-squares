import { hapticPatterns, type HapticToken } from "../tokens/haptics";

/** Trigger haptic feedback via Web Vibration API when available. */
export function triggerHaptic(token: HapticToken): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(hapticPatterns[token]);
}

export type MotionClass =
  | "sqds-animate-fade-in"
  | "sqds-animate-slide-up"
  | "sqds-animate-scale-in"
  | "sqds-animate-pulse"
  | "sqds-animate-winning"
  | "sqds-animate-glow"
  | "sqds-animate-ripple";

export const motionClasses = {
  fadeIn: "sqds-animate-fade-in" as const,
  slideUp: "sqds-animate-slide-up" as const,
  scaleIn: "sqds-animate-scale-in" as const,
  pulse: "sqds-animate-pulse" as const,
  winning: "sqds-animate-winning" as const,
  glow: "sqds-animate-glow" as const,
  ripple: "sqds-animate-ripple" as const,
};

/** Check if user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { motion, motionPresets, motionDurations, motionEasings } from "../tokens/motion";
