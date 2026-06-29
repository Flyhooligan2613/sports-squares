/** Semantic color token keys — values live in sqds.css as CSS custom properties. */
export const colorTokens = {
  primary: "var(--sqds-color-primary)",
  primaryHover: "var(--sqds-color-primary-hover)",
  primaryMuted: "var(--sqds-color-primary-muted)",
  secondary: "var(--sqds-color-secondary)",
  accent: "var(--sqds-color-accent)",
  background: "var(--sqds-color-background)",
  surface: "var(--sqds-color-surface)",
  surfaceElevated: "var(--sqds-color-surface-elevated)",
  glass: "var(--sqds-color-glass)",
  glassBorder: "var(--sqds-color-glass-border)",
  divider: "var(--sqds-color-divider)",
  text: "var(--sqds-color-text)",
  textMuted: "var(--sqds-color-text-muted)",
  success: "var(--sqds-color-success)",
  warning: "var(--sqds-color-warning)",
  error: "var(--sqds-color-error)",
  information: "var(--sqds-color-information)",
  revenueGreen: "var(--sqds-color-revenue-green)",
  winningGold: "var(--sqds-color-winning-gold)",
  executivePurple: "var(--sqds-color-executive-purple)",
  walletBlue: "var(--sqds-color-wallet-blue)",
  riskOrange: "var(--sqds-color-risk-orange)",
} as const;

export type ColorToken = keyof typeof colorTokens;

export const colors = colorTokens;
