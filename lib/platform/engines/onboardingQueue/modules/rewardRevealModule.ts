import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const rewardRevealModule: OnboardingModule = {
  id: "reward_reveal",
  priority: 1,
  order: 4,
  title: ONBOARDING_COPY.rewardRevealTitle,
  isEligible: (ctx) =>
    ctx.state.completedSteps.includes("mystery_pass") &&
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("reward_reveal"),
};

Queue.add(rewardRevealModule);
