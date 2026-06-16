import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const mysteryPassModule: OnboardingModule = {
  id: "mystery_pass",
  priority: 1,
  order: 3,
  title: ONBOARDING_COPY.mysteryTitle,
  isEligible: (ctx) =>
    ctx.state.completedSteps.includes("welcome") &&
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("mystery_pass"),
};

Queue.add(mysteryPassModule);
