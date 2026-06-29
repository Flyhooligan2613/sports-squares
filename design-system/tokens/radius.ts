export const radiusTokens = {
  sm: "var(--sqds-radius-sm)",
  md: "var(--sqds-radius-md)",
  lg: "var(--sqds-radius-lg)",
  xl: "var(--sqds-radius-xl)",
  pill: "var(--sqds-radius-pill)",
} as const;

export type RadiusToken = keyof typeof radiusTokens;

export const radius = radiusTokens;
