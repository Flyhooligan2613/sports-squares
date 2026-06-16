import { ONBOARDING_LEGACY_SKIP_HOURS } from "./config";
import {
  fetchAccountAgeHours,
  fetchQueueState,
  migrateFromAutomationState,
  upsertQueueState,
} from "./repository";
import type { OnboardingModuleId } from "./types";

export async function ensureQueueState(email: string) {
  let state = await fetchQueueState(email);
  if (state) return state;

  state = await migrateFromAutomationState(email);
  if (state) return state;

  const accountAgeHours = (await fetchAccountAgeHours(email)) ?? 0;
  const isLegacy = accountAgeHours > ONBOARDING_LEGACY_SKIP_HOURS;
  const now = isLegacy ? new Date().toISOString() : null;

  const completed = isLegacy
    ? ([
        "account_created",
        "welcome",
        "mystery_pass",
        "reward_reveal",
        "profile",
        "missions",
        "competitor_score",
        "choose_journey",
        "navigate_dashboard",
      ] as OnboardingModuleId[])
    : (["account_created"] as OnboardingModuleId[]);

  return upsertQueueState(email, {
    completedSteps: completed,
    skippedSteps: [],
    currentStepId: isLegacy ? null : "welcome",
    interruptedAt: isLegacy ? null : now,
    version: 1,
  });
}
