import { buildEligibilityContext } from "./EligibilityService";
import { buildExperienceQueue } from "./ExperienceQueue";
import { revealMysterySquarePass } from "./MysterySquarePassService";
import { grantFounderRecognition } from "./FounderRecognitionService";
import { grantDailyBonus, checkDailyBonus } from "./DailyBonusService";
import { grantFlashEventReward } from "./FlashEventService";
import { distributeRewards } from "../RewardDistributionService";
import { upsertAutomationState } from "./repository";
import type {
  SquarePassAutomationQueueResult,
  SquarePassCompleteStepId,
  SquarePassExperienceId,
  SquarePassMysteryRevealResult,
} from "./types";

const STEP_TIMESTAMP_MAP: Partial<
  Record<SquarePassCompleteStepId, keyof Awaited<ReturnType<typeof upsertAutomationState>>>
> = {
  welcome: "welcomeCompletedAt",
  mystery: "mysteryRevealedAt",
  reward_reveal: "rewardRevealCompletedAt",
  founder: "founderClaimedAt",
  whats_next: "whatsNextCompletedAt",
  profile_customization: "profileCustomizationCompletedAt",
};

export async function getAutomationQueue(email: string): Promise<SquarePassAutomationQueueResult> {
  const ctx = await buildEligibilityContext(email);
  const queue = await buildExperienceQueue(email, ctx);

  return {
    queue,
    state: {
      welcomeCompletedAt: ctx.state.welcomeCompletedAt,
      mysteryRevealedAt: ctx.state.mysteryRevealedAt,
      lastDailyBonusAt: ctx.state.lastDailyBonusAt,
    },
  };
}

export async function completeAutomationStep(
  email: string,
  stepId: SquarePassCompleteStepId,
  metadata?: { flashCampaignSlug?: string; surpriseSlug?: string }
): Promise<{ ok: true }> {
  const ctx = await buildEligibilityContext(email);
  const now = new Date().toISOString();
  const completed = new Set(ctx.state.experiencesCompleted);
  completed.add(stepId);

  const patch: Parameters<typeof upsertAutomationState>[1] = {
    experiencesCompleted: Array.from(completed),
  };

  const tsKey = STEP_TIMESTAMP_MAP[stepId];
  if (tsKey) {
    (patch as Record<string, unknown>)[tsKey] = now;
  }

  if (stepId === "daily_bonus") {
    patch.lastDailyBonusAt = now;
  }

  if (stepId === "flash_event" && metadata?.flashCampaignSlug) {
    patch.flashEventsSeen = [
      ...ctx.state.flashEventsSeen,
      metadata.flashCampaignSlug,
    ];
  }

  if (stepId === "surprise" && metadata?.surpriseSlug) {
    patch.surprisesClaimed = [...ctx.state.surprisesClaimed, metadata.surpriseSlug];
  }

  if (stepId === "founder" && !ctx.state.founderClaimedAt) {
    await grantFounderRecognition(email);
    patch.founderClaimedAt = now;
  }

  if (stepId === "flash_event" && metadata?.flashCampaignSlug) {
    await grantFlashEventReward(email, metadata.flashCampaignSlug);
  }

  if (stepId === "surprise" && metadata?.surpriseSlug) {
    await handleSurpriseReveal(email, metadata.surpriseSlug);
  }

  await upsertAutomationState(email, patch);
  return { ok: true };
}

export async function revealMystery(email: string): Promise<SquarePassMysteryRevealResult> {
  const result = await revealMysterySquarePass(email);
  await upsertAutomationState(email, {
    mysteryRevealedAt: new Date().toISOString(),
  });
  return result;
}

export async function handleDailyBonus(email: string) {
  return checkDailyBonus(email);
}

export async function handleFlashReveal(email: string, campaignSlug: string) {
  const rewards = await grantFlashEventReward(email, campaignSlug);
  return { rewards };
}

export async function handleSurpriseReveal(email: string, surpriseSlug: string) {
  const rewards = await distributeRewards(
    email,
    [{ type: "xp", amount: 75, label: "75 Surprise XP" }],
    `square_pass_surprise_${surpriseSlug}`
  );
  return { rewards };
}

/** SquarePassAutomationEngine™ — New Competitor Automated Experience orchestrator. */
export const AutomationEngine = {
  getQueue: getAutomationQueue,
  completeStep: completeAutomationStep,
  revealMystery,
  getDailyBonus: handleDailyBonus,
  revealFlash: handleFlashReveal,
  revealSurprise: handleSurpriseReveal,
  grantDailyBonus,
};

export type AutomationEngineType = typeof AutomationEngine;
