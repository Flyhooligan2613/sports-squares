/** Spacing scale — 4px base unit. */
export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export type SpacingValue = (typeof spacingScale)[number];

export const spacingTokens = {
  1: "var(--sqds-space-1)",
  2: "var(--sqds-space-2)",
  3: "var(--sqds-space-3)",
  4: "var(--sqds-space-4)",
  5: "var(--sqds-space-5)",
  6: "var(--sqds-space-6)",
  8: "var(--sqds-space-8)",
  10: "var(--sqds-space-10)",
  12: "var(--sqds-space-12)",
  16: "var(--sqds-space-16)",
} as const;

export const spacing = spacingTokens;
