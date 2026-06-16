import {
  COMPETITOR_SCORE_RANK_THRESHOLDS,
  COMPETITOR_SCORE_WEIGHTS,
} from "@/lib/competitorCard/config";
import type {
  CompetitorScore,
  CompetitorScoreBreakdown,
  CompetitorScoreRankTitle,
} from "@/lib/competitorCard/types";

export interface CompetitorScoreInput {
  boardsPlayed: number;
  lifetimeWins: number;
  unlockedAchievements: number;
  longestWinStreak: number;
  tierSortOrder: number;
  followerCount: number;
  communityReputation: number;
  qualifiedReferrals: number;
  /** Geo fields for percentile estimates (optional). */
  state?: string | null;
  city?: string | null;
  friendCount?: number;
  friendRank?: number | null;
  podiumChampionships?: number;
  podiumRunnerUp?: number;
  podiumThird?: number;
  nearPerfect?: number;
}

/**
 * Competitor Score™ — merit-only composite index (0–10,000 scale).
 *
 * Formula (caps prevent pay-to-win inflation):
 *   participation = min(boardsPlayed × 15, 750)
 *   wins          = min(lifetimeWins × 40, 2000)
 *   achievements  = min(unlocked × 120, 1200)
 *   streaks       = min(longestWinStreak × 80, 800)
 *   tier          = min(tierSortOrder × 200, 1600)
 *   community     = min(followers × 5 + reputation, 600)
 *   referrals     = min(qualifiedReferrals × 50, 500)
 *
 * NEVER includes deposits, purchases, square credits spent, or wallet balance.
 */
export function computeCompetitorScore(input: CompetitorScoreInput): CompetitorScore {
  const w = COMPETITOR_SCORE_WEIGHTS;

  const breakdown: CompetitorScoreBreakdown = {
    participation: Math.min(input.boardsPlayed * w.participationPerBoard, w.participationCap),
    wins: Math.min(input.lifetimeWins * w.winPerWin, w.winCap),
    achievements: Math.min(input.unlockedAchievements * w.achievementPerUnlock, w.achievementCap),
    streaks: Math.min(input.longestWinStreak * w.streakPerWin, w.streakCap),
    tier: Math.min(input.tierSortOrder * w.tierPerSortOrder, w.tierCap),
    community: Math.min(
      input.followerCount * w.communityFollower +
        input.communityReputation * w.communityReputation,
      w.communityCap
    ),
    referrals: Math.min(input.qualifiedReferrals * w.referralPerQualified, w.referralCap),
    podium: Math.min(
      (input.podiumChampionships ?? 0) * w.podiumChampionship +
        (input.podiumRunnerUp ?? 0) * w.podiumRunnerUp +
        (input.podiumThird ?? 0) * w.podiumThird +
        (input.nearPerfect ?? 0) * w.nearPerfect,
      w.podiumChampionshipCap + w.podiumRunnerUpCap + w.podiumThirdCap + w.nearPerfectCap
    ),
  };

  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
  const rankTitle = resolveRankTitle(total);
  const percentiles = estimatePercentiles(total, input);

  return { total, rankTitle, breakdown, percentiles };
}

function resolveRankTitle(score: number): CompetitorScoreRankTitle {
  for (const tier of COMPETITOR_SCORE_RANK_THRESHOLDS) {
    if (score >= tier.minScore) return tier.title;
  }
  return "Rising Competitor";
}

/** Heuristic percentiles until global ranking tables exist. */
function estimatePercentiles(
  score: number,
  input: CompetitorScoreInput
): CompetitorScore["percentiles"] {
  const world = Math.min(99, Math.max(1, Math.round((score / 10000) * 98 + 1)));

  const state =
    input.state && score > 0
      ? Math.min(99, Math.max(5, world + Math.round((input.communityReputation % 7) - 3)))
      : null;

  const city =
    input.city && score > 0
      ? Math.min(99, Math.max(10, (state ?? world) + Math.round((input.followerCount % 5) - 2)))
      : null;

  let friends: number | null = null;
  if (input.friendCount && input.friendCount > 0 && input.friendRank != null) {
    friends = Math.min(
      99,
      Math.max(1, Math.round(((input.friendCount - input.friendRank) / input.friendCount) * 100))
    );
  }

  return { world, state, city, friends };
}
