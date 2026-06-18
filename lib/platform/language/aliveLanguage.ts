/**
 * AliveEngine™ copy — Platform Build Spec #013 (PROJECT BLACK LABEL™)
 */

export const ALIVE_BRAND = {
  engine: "AliveEngine™",
  platformPulse: "Platform Pulse™",
  personalPulse: "Personal Pulse™",
  squareBank: "SquareBank™",
  squarePass: "SquarePass™",
  squareWallet: "SquareWallet™",
  competitorScore: "Competitor Score™",
  legacy: "Legacy™",
  trustSecure: "Secure by SquareBank™",
  trustVerified: "Verified Payouts™",
  trustCommunity: "Live Community™",
} as const;

export const ALIVE_COPY = {
  greetingMorning: "Good morning",
  greetingAfternoon: "Good afternoon",
  greetingEvening: "Good evening",
  greetingNight: "Good night",
  platformPulseSubtitle: "Live momentum across SquareBoards today",
  personalPulseSubtitle: "Your progress, streaks, and next moves",
  activityFeedTitle: "Live Activity",
  walletInsightsTitle: "Wallet Intelligence",
  communityPresenceTitle: "Community Pulse",
  emptyStateHeading: "The arena is warming up",
  emptyStateBody: "Here are your best next moves while contests fill in.",
  trustBadgeAria: "Platform trust indicators",
  celebrationMilestone: "Milestone unlocked",
  skeletonLoading: "Loading pulse data…",
} as const;

export const ALIVE_STAT_LABELS = {
  contestsCompleted: "Contests completed today",
  prizeAwarded: "Prize money awarded",
  rewardsClaimed: "Rewards claimed",
  contestsFilling: "Contests filling now",
  competitorsJoined: "Competitors joined today",
  rankPromotions: "Rank promotions today",
  playersOnline: "Players online now",
} as const;

export function aliveGreeting(timeOfDay?: "morning" | "afternoon" | "evening" | "night"): string {
  switch (timeOfDay) {
    case "morning":
      return ALIVE_COPY.greetingMorning;
    case "afternoon":
      return ALIVE_COPY.greetingAfternoon;
    case "evening":
      return ALIVE_COPY.greetingEvening;
    case "night":
      return ALIVE_COPY.greetingNight;
    default:
      return resolveTimeOfDayGreeting();
  }
}

export function resolveTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return ALIVE_COPY.greetingMorning;
  if (hour < 17) return ALIVE_COPY.greetingAfternoon;
  if (hour < 21) return ALIVE_COPY.greetingEvening;
  return ALIVE_COPY.greetingNight;
}
