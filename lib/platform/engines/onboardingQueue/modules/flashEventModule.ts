import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const flashEventModule: OnboardingModule = {
  id: "flash_event",
  priority: 2,
  order: 7,
  title: ONBOARDING_COPY.flashTitle,
  isEligible: (ctx) => {
    if (ctx.state.onboardingComplete) {
      return ctx.flashEvents.length > 0;
    }
    return (
      ctx.state.completedSteps.includes("reward_reveal") && ctx.flashEvents.length > 0
    );
  },
  buildPayload: (ctx) => {
    const flash = ctx.flashEvents[0];
    if (!flash) return undefined;
    return {
      flashEndsAt: flash.endsAt,
      flashCampaignSlug: flash.campaign.slug,
    };
  },
};

Queue.add(flashEventModule);
