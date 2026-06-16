import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import type { OnboardingModuleId } from "@/lib/platform/engines/onboardingQueue";
import { legacyStepToModuleId } from "./ExperienceQueue";
import { grantDailyBonus, checkDailyBonus } from "./DailyBonusService";
import { grantFlashEventReward } from "./FlashEventService";
import { distributeRewards } from "../RewardDistributionService";
import { fetchAutomationState } from "./repository";
import type {
  SquarePassAutomationQueueResult,
  SquarePassCompleteStepId,
  SquarePassExperienceId,
  SquarePassMysteryRevealResult,
} from "./types";

const LEGACY_ID_MAP: Partial<Record<OnboardingModuleId, SquarePassExperienceId>> = {
  mystery_pass: "mystery",
  profile: "profile_customization",
  missions: "whats_next",
};

function toModuleId(stepId: SquarePassCompleteStepId): OnboardingModuleId {
  const mapped = legacyStepToModuleId(stepId as SquarePassExperienceId);
  if (mapped) return mapped;
  return stepId as OnboardingModuleId;
}

export async function getAutomationQueue(email: string): Promise<SquarePassAutomationQueueResult> {
  const result = await OnboardingQueueEngine.getQueue(email);
  const automationState = await fetchAutomationState(email);

  const queue = result.queue.map((step) => ({
    id: LEGACY_ID_MAP[step.id] ?? (step.id as SquarePassExperienceId),
    title: step.title,
    payload: step.payload,
  }));

  return {
    queue,
    state: {
      welcomeCompletedAt: automationState?.welcomeCompletedAt ?? null,
      mysteryRevealedAt: automationState?.mysteryRevealedAt ?? null,
      lastDailyBonusAt: automationState?.lastDailyBonusAt ?? null,
    },
  };
}

export async function completeAutomationStep(
  email: string,
  stepId: SquarePassCompleteStepId,
  metadata?: { flashCampaignSlug?: string; surpriseSlug?: string }
): Promise<{ ok: true }> {
  await OnboardingQueueEngine.completeModule(email, {
    moduleId: toModuleId(stepId),
    metadata,
  });
  return { ok: true };
}

export async function revealMystery(email: string): Promise<SquarePassMysteryRevealResult> {
  return OnboardingQueueEngine.revealMystery(email);
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

/** SquarePassAutomationEngine™ — delegates onboarding to OnboardingQueueEngine. */
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
