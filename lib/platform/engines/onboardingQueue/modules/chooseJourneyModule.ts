import { Queue } from "../QueueRegistry";
import { EligibilityResolver } from "../EligibilityResolver";
import type { OnboardingModule } from "../types";
import { JOURNEY_OPTIONS, ONBOARDING_COPY } from "../config";

export const chooseJourneyModule: OnboardingModule = {
  id: "choose_journey",
  priority: 1,
  order: 12,
  title: ONBOARDING_COPY.chooseJourneyTitle,
  isEligible: async (ctx) =>
    !ctx.isLegacyAccount &&
    !ctx.state.completedSteps.includes("choose_journey") &&
    (await EligibilityResolver.arePriorStepsResolved("choose_journey", ctx)),
  buildPayload: () => ({
    journeyOptions: JOURNEY_OPTIONS.map((o) => ({ ...o })),
  }),
};

Queue.add(chooseJourneyModule);
