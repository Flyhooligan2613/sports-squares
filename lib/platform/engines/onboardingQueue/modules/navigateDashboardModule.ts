import { Queue } from "../QueueRegistry";
import { EligibilityResolver } from "../EligibilityResolver";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const navigateDashboardModule: OnboardingModule = {
  id: "navigate_dashboard",
  priority: 1,
  order: 13,
  title: ONBOARDING_COPY.navigateTitle,
  isEligible: async (ctx) =>
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("navigate_dashboard") &&
    (await EligibilityResolver.arePriorStepsResolved("navigate_dashboard", ctx)),
};

Queue.add(navigateDashboardModule);
