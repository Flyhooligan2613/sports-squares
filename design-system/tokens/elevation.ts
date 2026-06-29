export const elevationTokens = {
  none: "var(--sqds-shadow-none)",
  sm: "var(--sqds-shadow-sm)",
  md: "var(--sqds-shadow-md)",
  lg: "var(--sqds-shadow-lg)",
  xl: "var(--sqds-shadow-xl)",
  glass: "var(--sqds-shadow-glass)",
  glow: "var(--sqds-shadow-glow)",
  glowGold: "var(--sqds-shadow-glow-gold)",
  glowSuccess: "var(--sqds-shadow-glow-success)",
} as const;

export type ElevationToken = keyof typeof elevationTokens;

export const elevation = elevationTokens;
