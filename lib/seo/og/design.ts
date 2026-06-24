/** SquareBoards OG design system — dark premium gaming aesthetic. */
export const OG_COLORS = {
  bg: "#030712",
  surface: "#081228",
  surfaceAlt: "#0c1830",
  purple: "#5B4CF7",
  glow: "#7B61FF",
  violet: "#A855F7",
  gold: "#F6C453",
  cyan: "#22D3EE",
  success: "#34D399",
  muted: "#94A3B8",
  white: "#FFFFFF",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
} as const;

export const OG_BRAND = {
  name: "SquareBoards™",
  tagline: "Compete • Build Your Legacy • Win Rewards",
  footer: "Compete. Build Your Legacy.",
} as const;

export const OG_REVALIDATE = 3600;

/** @vercel/og requires solid fills via backgroundColor — not as a backgroundImage layer. */
export function ogBackground(extraGlow = false): {
  backgroundColor: string;
  backgroundImage: string;
} {
  const glow = extraGlow ? "rgba(91, 76, 247, 0.45)" : "rgba(91, 76, 247, 0.35)";
  return {
    backgroundColor: OG_COLORS.bg,
    backgroundImage: `radial-gradient(ellipse 90% 70% at 20% 0%, ${glow}, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(168, 85, 247, 0.18), transparent 50%)`,
  };
}
