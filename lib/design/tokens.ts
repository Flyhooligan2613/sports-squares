/** SquareBoards premium design tokens — visual only */
export const colors = {
  bg: "#030712",
  bgSecondary: "#081228",
  purple: "#5B4CF7",
  glow: "#7B61FF",
  success: "#22E584",
  gold: "#F6C453",
  text: "#FFFFFF",
  textMuted: "#94A3B8",
  textSecondary: "#D4D7E5",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(123, 97, 255, 0.25)",
} as const;

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
} as const;

export const spacing = {
  sectionY: "4rem",
  sectionYSm: "6rem",
  cardPadding: "1.25rem",
  cardPaddingLg: "1.5rem",
  heroGap: "2.5rem",
} as const;

export const motion = {
  fast: "150ms",
  normal: "300ms",
  slow: "450ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const shadows = {
  card: "0 4px 24px rgba(0, 0, 0, 0.35)",
  cardHover: "0 12px 40px rgba(91, 76, 247, 0.12)",
  glow: "0 0 20px rgba(123, 97, 255, 0.15)",
} as const;

export const statusVariants = {
  live: "sb-status-badge--live",
  upcoming: "sb-status-badge--upcoming",
  info: "sb-status-badge--info",
  winner: "sb-status-badge--winner",
  processing: "sb-status-badge--processing",
  urgent: "sb-status-badge--urgent",
} as const;
