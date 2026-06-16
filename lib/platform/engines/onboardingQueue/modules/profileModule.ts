import { Queue } from "../QueueRegistry";
import { EligibilityResolver } from "../EligibilityResolver";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const profileModule: OnboardingModule = {
  id: "profile",
  priority: 1,
  order: 9,
  title: ONBOARDING_COPY.profileTitle,
  isEligible: async (ctx) =>
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("profile") &&
    (await EligibilityResolver.arePriorStepsResolved("profile", ctx)),
};

Queue.add(profileModule);
