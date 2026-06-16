/**
 * Empty state copy — encouraging, actionable, never broken-feeling.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

import { CONTEST_CTAS } from "@/lib/platform/language/contestLanguage";

export const EMPTY_STATE = {
  noContests: {
    title: "No contests are available right now.",
    body: "The arena is gearing up. Explore upcoming sports, check the Daily Story, or connect with the community while the next contest opens.",
    ctaBrowse: CONTEST_CTAS.browseLiveContests,
    ctaCommunity: "Community",
    ctaDailyStory: "Daily Story",
    upcomingHint: "Upcoming: NFL · MLB · NBA · Pick'em · Survivor · Tournament Royale",
  },
  noGames: {
    title: "No contests this week yet",
    body: "New contests open automatically throughout the day. Browse the marketplace or check back soon.",
    cta: CONTEST_CTAS.browseContests,
  },
  noGamesListed: {
    title: "No contests listed yet",
    body: "The marketplace is preparing the next wave of competitions.",
    cta: CONTEST_CTAS.browseContests,
  },
  noGamesAvailable: {
    title: "No contests available",
    body: "No contests are currently available. New boards open automatically throughout the day.",
    cta: CONTEST_CTAS.browseContests,
  },
  noGamesOnClock: {
    title: "No contests on the clock",
    body: "Check back soon — the next competition window is approaching.",
  },
  noRankings: {
    title: "No rankings yet",
    body: "Be the first on the board — join a contest and start building your legacy.",
    cta: CONTEST_CTAS.joinTheContest,
  },
  noRewards: {
    title: "No rewards yet",
    body: "Compete in contests and open your Weekly Reward Drop to unlock achievements.",
    cta: "Open Reward Drop",
  },
  noFollowers: {
    title: "No followers yet",
    body: "Share your Competitor Profile and join The Huddle to build your community.",
    cta: "Share Profile",
  },
  noActivity: {
    title: "Your legacy timeline starts now",
    body: "Join your first contest — every competition adds to your legacy.",
    cta: CONTEST_CTAS.joinTheContest,
  },
  noPicks: {
    title: "No picks yet",
    body: "Lock in your contest picks before kickoff.",
    cta: "Lock In Your Contest",
  },
  filteredContestsEmpty: {
    title: "No contests match your filters",
    body: "Try a different sport or filter to discover available competitions.",
  },
} as const;

export type EmptyStateKey = keyof typeof EMPTY_STATE;
