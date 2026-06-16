import { Queue } from "../QueueRegistry";
import { EligibilityResolver } from "../EligibilityResolver";
import { computeCompetitorScore } from "@/lib/competitorCard/competitorScore";
import { applyGenesisStartingScore } from "@/lib/platform/engines/genesis/score";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const competitorScoreModule: OnboardingModule = {
  id: "competitor_score",
  priority: 1,
  order: 11,
  title: ONBOARDING_COPY.competitorScoreTitle,
  isEligible: async (ctx) =>
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("competitor_score") &&
    (await EligibilityResolver.arePriorStepsResolved("competitor_score", ctx)),
  buildPayload: async (ctx) => {
    const base = computeCompetitorScore({
      boardsPlayed: 0,
      lifetimeWins: 0,
      unlockedAchievements: 0,
      longestWinStreak: 0,
      tierSortOrder: 1,
      followerCount: 0,
      communityReputation: 0,
      qualifiedReferrals: 0,
    });
    const score = applyGenesisStartingScore(base, {
      genesisActive: ctx.rookieSeasonActive,
      boardsPlayed: 0,
    });
    return {
      competitorScore: {
        total: score.total,
        genesisStartingBonus: score.genesisStartingBonus,
        rankTitle: score.rankTitle,
      },
    };
  },
};

Queue.add(competitorScoreModule);
