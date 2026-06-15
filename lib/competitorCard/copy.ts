/**
 * Competitor Card™ section copy — uses Contest Language Engine™ terms.
 */

import { EMPTY_STATE, PLAYER_TERMS, PROFILE_LABELS } from "@/lib/platform/language";

export const COMPETITOR_CARD_COPY = {
  title: PLAYER_TERMS.competitorCard,
  profileTitle: PLAYER_TERMS.competitorProfile,
  hubLabel: PROFILE_LABELS.competitorHub,
  scoreLabel: "Competitor Score",
  rankLabel: "Rank Title",
  heroStats: "Hero Stats",
  tierProgress: "Tier Progress",
  reputation: "Reputation",
  careerShowcase: "Career Showcase",
  trophyRoom: "Trophy Room",
  legacyTimeline: "Legacy Timeline",
  seasonDashboard: "Season Dashboard",
  careerRecords: "Career Records",
  rivalries: "Rivalries",
  community: "Community",
  achievements: "Achievements",
  customization: "Customization",
  shareProfile: "Share Profile",
  follow: "Follow",
  following: "Following",
  challenge: "Challenge",
  report: "Report",
  comingSoon: "Coming soon",
  percentiles: {
    world: "World",
    state: "State",
    city: "City",
    friends: "Friends",
  },
  empty: {
    trophies: {
      title: "Trophy room awaits",
      body: "Win contests and unlock achievements to fill your trophy case.",
    },
    timeline: {
      title: EMPTY_STATE.noActivity.title,
      body: EMPTY_STATE.noActivity.body,
    },
    rivalries: {
      title: "No rivalries yet",
      body: "Head-to-head rivalries will appear as you compete against the same competitors.",
    },
    achievements: {
      title: EMPTY_STATE.noRewards.title,
      body: EMPTY_STATE.noRewards.body,
    },
    community: {
      title: EMPTY_STATE.noFollowers.title,
      body: EMPTY_STATE.noFollowers.body,
    },
    showcase: {
      title: "Build your showcase",
      body: "Your best wins and achievements will appear here as you compete.",
    },
  },
  errors: {
    loadFailed: "Could not load Competitor Card. Try again.",
    sectionFailed: "This section could not load right now.",
  },
} as const;
