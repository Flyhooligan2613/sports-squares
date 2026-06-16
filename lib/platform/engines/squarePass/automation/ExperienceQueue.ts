import { AUTOMATION_COPY } from "./config";
import type { EligibilityContext } from "./EligibilityService";
import { isExperienceEligible } from "./EligibilityService";
import type { SquarePassExperienceId, SquarePassExperienceStep } from "./types";
import { GenesisEngine } from "@/lib/platform/engines/genesis/GenesisEngine";
import { GENESIS_MISSION_MAP } from "@/lib/platform/engines/genesis/config";
import { fetchPlayerRegistrationOrder } from "./repository";
import { FOUNDING_COMPETITOR_LIMIT } from "./config";

const ONBOARDING_ORDER: SquarePassExperienceId[] = [
  "welcome",
  "mystery",
  "reward_reveal",
  "founder",
  "whats_next",
  "profile_customization",
];

const RETURNING_ORDER: SquarePassExperienceId[] = [
  "daily_bonus",
  "flash_event",
  "surprise",
];

const STEP_TITLES: Record<SquarePassExperienceId, string> = {
  welcome: AUTOMATION_COPY.welcomeTitle,
  mystery: AUTOMATION_COPY.mysteryTitle,
  reward_reveal: AUTOMATION_COPY.rewardRevealTitle,
  founder: AUTOMATION_COPY.founderTitle,
  whats_next: AUTOMATION_COPY.whatsNextTitle,
  profile_customization: AUTOMATION_COPY.profileTitle,
  daily_bonus: AUTOMATION_COPY.dailyTitle,
  flash_event: AUTOMATION_COPY.flashTitle,
  surprise: AUTOMATION_COPY.surpriseTitle,
};

async function buildStepPayload(
  id: SquarePassExperienceId,
  email: string,
  ctx: EligibilityContext
): Promise<SquarePassExperienceStep["payload"]> {
  if (id === "founder") {
    const order = (await fetchPlayerRegistrationOrder(email)) ?? 0;
    return { founderNumber: order, founderLimit: FOUNDING_COMPETITOR_LIMIT };
  }

  if (id === "whats_next") {
    const progress = await GenesisEngine.getProgress(email);
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
  }

  if (id === "flash_event" && ctx.flashEvents[0]) {
    const flash = ctx.flashEvents[0];
    return {
      flashEndsAt: flash.endsAt,
      flashCampaignSlug: flash.campaign.slug,
    };
  }

  if (id === "surprise") {
    return { surpriseSlug: "rookie_surprise_day1" };
  }

  return undefined;
}

export async function buildExperienceQueue(
  email: string,
  ctx: EligibilityContext
): Promise<SquarePassExperienceStep[]> {
  const queue: SquarePassExperienceStep[] = [];
  const onboardingIncomplete = ONBOARDING_ORDER.some((id) => isExperienceEligible(id, ctx));

  const order = onboardingIncomplete ? ONBOARDING_ORDER : RETURNING_ORDER;

  for (const id of order) {
    if (!isExperienceEligible(id, ctx)) continue;
    const payload = await buildStepPayload(id, email, ctx);
    queue.push({
      id,
      title: STEP_TITLES[id],
      payload,
    });
  }

  return queue;
}
