/**
 * Competitor identity, profile, and community terms.
 * Platform Polish Sprint #002 — Contest Language Engine™
 */

export const PLAYER_TERMS = {
  competitor: "Competitor",
  competitors: "Competitors",
  competitorCard: "Competitor Card",
  competitorProfile: "Competitor Profile",
  competitionHistory: "Competition History",
  champion: "Champion",
  champions: "Champions",
  topCompetitors: "Top Competitors",
  mostChampionships: "Most Championships",
  competitionRankings: "Competition Rankings",
  you: "You",
  /** Encouraging copy when a competitor did not win — never "Loser". */
  contestCompleteEncouragement: "Great effort — your competition continues across the platform.",
  seasonCompleteEncouragement: "Season complete. Your legacy keeps building.",
} as const;

export const PROFILE_LABELS = {
  competitorHub: "Competitor Hub",
  competitorProfile: "Competitor Profile",
  competitionHistory: "Competition History",
  settings: "Settings",
} as const;

export const REWARD_LABELS = {
  claimYourAchievement: "Claim Your Achievement",
  competitionReward: "Competition Reward",
  referralReward: "Referral Reward",
  myRewards: "My Rewards",
} as const;

export const COMMUNITY_LABELS = {
  competitionRankings: "Competition Rankings",
  topCompetitors: "Top Competitors",
  mostChampionships: "Most Championships",
  worldwideRankings: "Worldwide rankings",
  noRankingsYet: "No rankings yet",
  beFirstOnBoard: "Be the first on the board — join a contest and start building your legacy.",
} as const;

export type PlayerTermKey = keyof typeof PLAYER_TERMS;
