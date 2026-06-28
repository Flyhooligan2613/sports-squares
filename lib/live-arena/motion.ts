/** Shared motion tokens & haptic simulation for Live Arena™ */

export const LA_MOTION = {
  easeSpring: "cubic-bezier(0.34, 1.2, 0.64, 1)",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  durationFast: "0.25s",
  durationNormal: "0.45s",
  durationSlow: "0.7s",
  durationReveal: "1.6s",
} as const;

export type HapticIntensity = "light" | "medium" | "heavy";

export const HAPTIC_CLASS: Record<HapticIntensity, string> = {
  light: "la-haptic-light",
  medium: "la-haptic-medium",
  heavy: "la-haptic-heavy",
};

export const HAPTIC_DURATION_MS: Record<HapticIntensity, number> = {
  light: 280,
  medium: 420,
  heavy: 520,
};

/** CSS custom properties injected on `.la-root` via live-arena.css */
export const LA_MOTION_VARS = {
  "--la-ease-spring": LA_MOTION.easeSpring,
  "--la-ease-out": LA_MOTION.easeOut,
  "--la-ease-in-out": LA_MOTION.easeInOut,
  "--la-duration-fast": LA_MOTION.durationFast,
  "--la-duration-normal": LA_MOTION.durationNormal,
  "--la-duration-slow": LA_MOTION.durationSlow,
  "--la-duration-reveal": LA_MOTION.durationReveal,
} as const;
