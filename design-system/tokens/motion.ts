export const motionDurations = {
  instant: "var(--sqds-duration-instant)",
  fast: "var(--sqds-duration-fast)",
  normal: "var(--sqds-duration-normal)",
  slow: "var(--sqds-duration-slow)",
  slower: "var(--sqds-duration-slower)",
} as const;

export const motionEasings = {
  out: "var(--sqds-ease-out)",
  inOut: "var(--sqds-ease-in-out)",
  spring: "var(--sqds-ease-spring)",
  bounce: "var(--sqds-ease-bounce)",
} as const;

export const motionPresets = {
  cardHover: "var(--sqds-motion-card-hover)",
  buttonPress: "var(--sqds-motion-button-press)",
  pageTransition: "var(--sqds-motion-page-transition)",
  tabSwitch: "var(--sqds-motion-tab-switch)",
  counter: "var(--sqds-motion-counter)",
  fade: "var(--sqds-motion-fade)",
  slide: "var(--sqds-motion-slide)",
  scale: "var(--sqds-motion-scale)",
  spring: "var(--sqds-motion-spring)",
  glow: "var(--sqds-motion-glow)",
  pulse: "var(--sqds-motion-pulse)",
  ripple: "var(--sqds-motion-ripple)",
  winning: "var(--sqds-motion-winning)",
} as const;

export const motion = {
  durations: motionDurations,
  easings: motionEasings,
  presets: motionPresets,
} as const;
