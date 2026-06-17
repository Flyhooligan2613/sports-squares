/** Top-site banner — first-deposit match bonus promo (replaces live trial). */
export const LIVE_TRIAL_BANNER_ENABLED = true;

export const LIVE_TRIAL_BANNER = {
  title: "100% First Deposit Match",
  subtitle: "Up to $100 bonus · Play-only funds · Winnings are real cash",
  ctaLabel: "Claim Bonus",
  ctaHref: "/my-games/wallet?tab=deposit",
  dismissStorageKey: "sb-deposit-match-banner-dismissed",
} as const;

export function isLiveTrialBannerEnabled(): boolean {
  if (!LIVE_TRIAL_BANNER_ENABLED) return false;
  if (process.env.NEXT_PUBLIC_LIVE_TRIAL_BANNER === "false") return false;
  return true;
}

/** First-deposit match cap for UI copy (cents). */
export const FIRST_DEPOSIT_MATCH_MAX_CENTS = Number(
  process.env.NEXT_PUBLIC_FIRST_DEPOSIT_MATCH_MAX_CENTS ?? "10000"
);

export function formatFirstDepositMatchMax(): string {
  return `$${(FIRST_DEPOSIT_MATCH_MAX_CENTS / 100).toFixed(0)}`;
}
