import type { CompetitorScoreRankTitle } from "@/lib/competitorCard/types";

/** Merit-only score weights — never deposits or purchases. */
export const COMPETITOR_SCORE_WEIGHTS = {
  participationPerBoard: 15,
  participationCap: 750,
  winPerWin: 40,
  winCap: 2000,
  achievementPerUnlock: 120,
  achievementCap: 1200,
  streakPerWin: 80,
  streakCap: 800,
  tierPerSortOrder: 200,
  tierCap: 1600,
  communityFollower: 5,
  communityReputation: 1,
  communityCap: 600,
  referralPerQualified: 50,
  referralCap: 500,
  podiumChampionship: 120,
  podiumChampionshipCap: 1200,
  podiumRunnerUp: 60,
  podiumRunnerUpCap: 600,
  podiumThird: 40,
  podiumThirdCap: 400,
  nearPerfect: 25,
  nearPerfectCap: 250,
} as const;

export const COMPETITOR_SCORE_RANK_THRESHOLDS: {
  minScore: number;
  title: CompetitorScoreRankTitle;
}[] = [
  { minScore: 8500, title: "Legendary Competitor" },
  { minScore: 6500, title: "Champion Competitor" },
  { minScore: 4500, title: "Elite Competitor" },
  { minScore: 2500, title: "Veteran Competitor" },
  { minScore: 1000, title: "Contender" },
  { minScore: 0, title: "Rising Competitor" },
];

export const REPUTATION_TITLES = {
  verified: "Verified Competitor",
  creator: "Community Creator",
  streakMaster: "Streak Master",
  champion: "Contest Champion",
  veteran: "Season Veteran",
  referrer: "Community Builder",
  rising: "Rising Star",
} as const;

export const COMPETITOR_CARD_ANIMATION_MS = 280;
