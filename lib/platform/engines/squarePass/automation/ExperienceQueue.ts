import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import type {
  OnboardingModuleId,
  OnboardingQueueStep,
} from "@/lib/platform/engines/onboardingQueue";
import type { EligibilityContext } from "./EligibilityService";
import type { SquarePassExperienceId, SquarePassExperienceStep } from "./types";

const MODULE_TO_LEGACY: Partial<Record<OnboardingModuleId, SquarePassExperienceId>> = {
  welcome: "welcome",
  mystery_pass: "mystery",
  reward_reveal: "reward_reveal",
  founder: "founder",
  missions: "whats_next",
  profile: "profile_customization",
  flash_event: "flash_event",
  daily_bonus: "daily_bonus",
  surprise: "surprise",
};

const LEGACY_TO_MODULE: Partial<Record<SquarePassExperienceId, OnboardingModuleId>> =
  Object.fromEntries(
    Object.entries(MODULE_TO_LEGACY).map(([k, v]) => [v, k as OnboardingModuleId])
  ) as Partial<Record<SquarePassExperienceId, OnboardingModuleId>>;

function mapStep(step: OnboardingQueueStep): SquarePassExperienceStep {
  const legacyId = MODULE_TO_LEGACY[step.id] ?? (step.id as SquarePassExperienceId);
  return {
    id: legacyId,
    title: step.title,
    payload: step.payload,
  };
}

/** @deprecated Use OnboardingQueueEngine.getQueue — thin backwards-compat wrapper. */
export async function buildExperienceQueue(
  email: string,
  _ctx?: EligibilityContext
): Promise<SquarePassExperienceStep[]> {
  void _ctx;
  const result = await OnboardingQueueEngine.getQueue(email);
  return result.queue.map(mapStep);
}

export function legacyStepToModuleId(step: SquarePassExperienceId): OnboardingModuleId | null {
  return LEGACY_TO_MODULE[step] ?? null;
}

export { mapStep as mapOnboardingStepToLegacy };
