/**
 * Branded loading messages — rotating copy during wait states.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

export const LOADING_CONTEXTS = {
  general: [
    "Preparing today's contests…",
    "Loading your legacy…",
    "Checking live scores…",
  ],
  contestCenter: [
    "Scanning available contests…",
    "Finding featured competitions…",
    "Preparing today's contests…",
  ],
  winners: [
    "Calculating champions…",
    "Updating competition results…",
    "Loading hall of fame…",
  ],
  rewardDrop: [
    "Opening your Reward Drop…",
    "Preparing your achievements…",
    "Loading competition rewards…",
  ],
  profile: [
    "Loading your Competitor Profile…",
    "Building your legacy dashboard…",
    "Gathering competition history…",
  },
  leaderboard: [
    "Loading competition rankings…",
    "Calculating top competitors…",
    "Updating standings…",
  ],
  pickem: [
    "Loading live stats…",
    "Preparing this week's contest…",
    "Checking pick results…",
  ],
  survivor: [
    "Loading leagues…",
    "Checking survivor standings…",
    "Loading legacy board…",
  ],
  tournament: [
    "Loading tournament hub…",
    "Preparing bracket contests…",
  ],
  liveTv: [
    "Tuning into live action…",
    "Checking live scores…",
  ],
} as const;

export type LoadingContext = keyof typeof LOADING_CONTEXTS;

/** Pick a rotating loading message for a context. Uses timestamp for variety. */
export function getLoadingMessage(context: LoadingContext = "general"): string {
  const messages = LOADING_CONTEXTS[context];
  const index = Math.floor(Date.now() / 3000) % messages.length;
  return messages[index]!;
}

/** Pick a stable loading message by index (for SSR or deterministic tests). */
export function getLoadingMessageAt(
  context: LoadingContext,
  index: number
): string {
  const messages = LOADING_CONTEXTS[context];
  return messages[index % messages.length]!;
}

export const LOADING_DEFAULT = "Loading…";
