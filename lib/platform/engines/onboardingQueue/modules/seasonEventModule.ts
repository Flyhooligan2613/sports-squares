import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

/** Season event stub — active during Rookie Season. */
export const seasonEventModule: OnboardingModule = {
  id: "season_event",
  priority: 1,
  order: 8,
  title: ONBOARDING_COPY.seasonTitle,
  isEligible: (ctx) =>
    ctx.seasonEventActive &&
    !ctx.state.completedSteps.includes("season_event") &&
    ctx.state.completedSteps.includes("reward_reveal"),
  buildPayload: () => ({
    seasonEventTitle: ONBOARDING_COPY.seasonTitle,
    seasonEventMessage: ONBOARDING_COPY.seasonMessage,
  }),
  onComplete: async (ctx) => {
    const { distributeRewards } = await import(
      "@/lib/platform/engines/squarePass/RewardDistributionService"
    );
    await distributeRewards(
      ctx.email,
      [{ type: "xp", amount: 50, label: "50 Rookie Season XP" }],
      "onboarding_season_event"
    );
  },
};

Queue.add(seasonEventModule);
