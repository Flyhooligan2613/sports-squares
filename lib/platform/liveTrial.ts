/** Flip to false when the first-20 live trial closes. */
export const LIVE_TRIAL_BANNER_ENABLED = true;

export const LIVE_TRIAL_BANNER = {
  title: "SquareBoards Live Trial — Now Open",
  subtitle: "First 20 sign-ups · Real money · Start on $1 boards",
  ctaLabel: "Join Trial",
  ctaHref: "/my-games/login",
  dismissStorageKey: "sb-live-trial-banner-dismissed",
} as const;

export function isLiveTrialBannerEnabled(): boolean {
  if (!LIVE_TRIAL_BANNER_ENABLED) return false;
  if (process.env.NEXT_PUBLIC_LIVE_TRIAL_BANNER === "false") return false;
  return true;
}
