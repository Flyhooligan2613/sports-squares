export const typographyTokens = {
  displayXl: "sqds-text-display-xl",
  displayLarge: "sqds-text-display-lg",
  heading: "sqds-text-heading",
  subheading: "sqds-text-subheading",
  body: "sqds-text-body",
  caption: "sqds-text-caption",
  label: "sqds-text-label",
  button: "sqds-text-button",
  numbers: "sqds-text-numbers",
  monospace: "sqds-text-mono",
} as const;

export type TypographyToken = keyof typeof typographyTokens;

export const typography = typographyTokens;
