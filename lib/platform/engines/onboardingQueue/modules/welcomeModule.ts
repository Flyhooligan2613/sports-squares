import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const welcomeModule: OnboardingModule = {
  id: "welcome",
  priority: 1,
  order: 2,
  title: ONBOARDING_COPY.welcomeTitle,
  isEligible: (ctx) => !ctx.isLegacyAccount && !ctx.state.completedSteps.includes("welcome"),
};

Queue.add(welcomeModule);
