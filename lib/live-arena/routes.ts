/** Public prototype route — mock data only, no auth required. */
export const LIVE_ARENA_PATH = "/live-arena";

export const LIVE_ARENA = {
  path: LIVE_ARENA_PATH,
  exitHref: "/contest-center",
  exitLabel: "Exit Demo",
  demoLinkLabel: "Live Arena Demo",
  prototypeBadge: "Prototype",
} as const;
