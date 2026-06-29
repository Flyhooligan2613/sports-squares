/** Founder Mode — premium executive styling tokens. */
export const founderTokens = {
  gradientPrimary: "var(--sqds-founder-gradient-primary)",
  gradientGold: "var(--sqds-founder-gradient-gold)",
  gradientSurface: "var(--sqds-founder-gradient-surface)",
  borderGold: "var(--sqds-founder-border-gold)",
  glowGold: "var(--sqds-founder-glow-gold)",
  textGold: "var(--sqds-founder-text-gold)",
  shimmer: "var(--sqds-founder-shimmer)",
} as const;

export type FounderToken = keyof typeof founderTokens;

export const founder = founderTokens;
