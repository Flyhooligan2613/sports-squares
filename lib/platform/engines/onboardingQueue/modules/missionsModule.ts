import { Queue } from "../QueueRegistry";
import { EligibilityResolver } from "../EligibilityResolver";
import { GenesisEngine } from "@/lib/platform/engines/genesis/GenesisEngine";
import { GENESIS_MISSION_MAP } from "@/lib/platform/engines/genesis/config";
import type { OnboardingModule } from "../types";
import { ONBOARDING_COPY } from "../config";

export const missionsModule: OnboardingModule = {
  id: "missions",
  priority: 1,
  order: 10,
  title: ONBOARDING_COPY.missionsTitle,
  isEligible: async (ctx) =>
    !ctx.isLegacyAccount &&
    ctx.rookieSeasonActive &&
    !ctx.state.completedSteps.includes("missions") &&
    (await EligibilityResolver.arePriorStepsResolved("missions", ctx)),
  buildPayload: async (ctx) => {
    const progress = await GenesisEngine.getProgress(ctx.email);
    const missions =
      progress?.missions.slice(0, 5).map((m) => {
        const def = GENESIS_MISSION_MAP[m.missionId];
        return {
          id: m.missionId,
          title: def?.title ?? m.missionId,
          emoji: def?.emoji ?? "🎯",
          completed: m.status === "completed",
        };
      }) ?? [];
    return { missions };
  },
};

Queue.add(missionsModule);
