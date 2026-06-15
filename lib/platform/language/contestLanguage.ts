/**
 * Core contest/competition terms, status labels, and CTAs.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

import type { ContestStatus } from "@/lib/contestCenter/types";
import { BRANDED_MODULES } from "@/lib/platform/language/brandedModules";

/** Primary platform CTAs — never sportsbook/gambling tone. */
export const CONTEST_CTAS = {
  joinTheContest: "Join the Contest",
  competeNow: "Compete Now",
  lockInYourContest: "Lock In Your Contest",
  enterTheContest: "Enter the Contest",
  joinContest: "Join Contest",
  browseContests: "Browse Contests",
  browseLiveContests: "Browse Live Contests",
  findAContest: "Find a contest",
} as const;

export const CONTEST_CENTER = {
  title: BRANDED_MODULES.contestCenter,
  shortTitle: "Contest Center",
  subtitle: "Join a contest. Build your legacy. Compete with the community.",
  tagline: "Join a contest.",
  tagline2: "Build your legacy.",
  tagline3: "Compete with the community.",
  availableContests: "Available Contests",
  featuredContests: "Featured Contests",
  featuredCompetitions: "Featured Competitions",
  todaysLiveContests: "Today's Live Contests",
  trendingContests: "Trending Contests",
  friendsPlaying: "Friends Playing",
} as const;

/** Contest status → player-facing labels. */
export const CONTEST_STATUS_LABELS: Record<ContestStatus, string> = {
  coming_soon: "Open for Competition",
  open: "Accepting Competitors",
  filling: "Accepting Competitors",
  almost_full: "Only A Few Spots Remain",
  locked: "Contest Locked",
  live: "Competition In Progress",
  completed: "Contest Complete",
};

export const CONTEST_TERMS = {
  ...CONTEST_CTAS,
  ...CONTEST_CENTER,
  contestWinnings: "Contest Winnings",
  competitionHistory: "Competition History",
  competitionResults: "Competition Results",
  competitionReward: "Competition Reward",
  lifetimeContestWinnings: "Lifetime Contest Winnings",
  totalContestWinnings: "Total Contest Winnings",
} as const;

export function contestSpotsRemaining(count: number): string {
  return count === 1 ? "1 spot remains" : `${count} spots remain`;
}

export function contestSpotsLeft(count: number): string {
  return count === 1 ? "1 spot left" : `${count} spots left`;
}

export type ContestCtaKey = keyof typeof CONTEST_CTAS;
export type ContestTermKey = keyof typeof CONTEST_TERMS;
