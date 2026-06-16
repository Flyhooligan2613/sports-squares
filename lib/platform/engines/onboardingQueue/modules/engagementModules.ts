import { Queue } from "../QueueRegistry";
import { fetchAutomationState } from "@/lib/platform/engines/squarePass/automation/repository";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const dailyBonusModule: OnboardingModule = {
  id: "daily_bonus",
  priority: 10,
  order: 100,
  title: ONBOARDING_COPY.dailyTitle,
  isEligible: (ctx) =>
    ctx.state.onboardingComplete &&
    ctx.state.completedSteps.includes("welcome") &&
    ctx.dailyBonusAvailable,
};

Queue.add(dailyBonusModule);

export const surpriseModule: OnboardingModule = {
  id: "surprise",
  priority: 11,
  order: 101,
  title: ONBOARDING_COPY.surpriseTitle,
  isEligible: async (ctx) => {
    const state = await fetchAutomationState(ctx.email);
    return (
      ctx.state.onboardingComplete &&
      !ctx.isLegacyAccount &&
      ctx.accountAgeHours >= 1 &&
      ctx.accountAgeHours <= 72 &&
      !state?.surprisesClaimed.includes("rookie_surprise_day1")
    );
  },
  buildPayload: () => ({ surpriseSlug: "rookie_surprise_day1" }),
};

Queue.add(surpriseModule);
