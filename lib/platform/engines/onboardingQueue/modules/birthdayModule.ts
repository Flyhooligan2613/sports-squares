import { Queue } from "../QueueRegistry";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

/** Birthday reward stub — eligible when account anniversary matches today or admin forces. */
export const birthdayModule: OnboardingModule = {
  id: "birthday",
  priority: 1,
  order: 6,
  title: ONBOARDING_COPY.birthdayTitle,
  isEligible: (ctx) => ctx.isBirthdayToday && !ctx.state.completedSteps.includes("birthday"),
  buildPayload: () => ({
    birthdayRewardLabel: "100 Birthday XP + Rookie Badge",
  }),
  onComplete: async (ctx) => {
    const { distributeRewards } = await import(
      "@/lib/platform/engines/squarePass/RewardDistributionService"
    );
    await distributeRewards(
      ctx.email,
      [{ type: "xp", amount: 100, label: "100 Birthday XP" }],
      "onboarding_birthday_reward"
    );
  },
};

Queue.add(birthdayModule);
