import { Queue } from "../QueueRegistry";
import { FOUNDING_COMPETITOR_LIMIT } from "@/lib/platform/engines/squarePass/automation/config";
import { fetchPlayerRegistrationOrder } from "@/lib/platform/engines/squarePass/automation/repository";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const founderModule: OnboardingModule = {
  id: "founder",
  priority: 1,
  order: 5,
  title: ONBOARDING_COPY.founderTitle,
  isEligible: (ctx) => ctx.founderEligible && !ctx.state.completedSteps.includes("founder"),
  buildPayload: async (ctx) => {
    const order = (await fetchPlayerRegistrationOrder(ctx.email)) ?? 0;
    return { founderNumber: order, founderLimit: FOUNDING_COMPETITOR_LIMIT };
  },
};

Queue.add(founderModule);
