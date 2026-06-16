import "./modules";
import {
  buildOnboardingQueue,
  completeOnboardingModule,
  skipOnboardingModule,
} from "./QueueExecutor";
import {
  fetchAllQueueConfig,
  resetQueueState,
  upsertQueueConfig,
  upsertQueueState,
} from "./repository";
import { ensureQueueState } from "./ensureQueueState";
import { buildEligibilityContext } from "./buildEligibilityContext";
import { QueueRegistry } from "./QueueRegistry";
import { revealMysterySquarePass } from "@/lib/platform/engines/squarePass/automation/MysterySquarePassService";
import { upsertAutomationState } from "@/lib/platform/engines/squarePass/automation/repository";
import type {
  CompleteModuleInput,
  OnboardingModuleId,
  OnboardingQueueConfigRow,
} from "./types";

export async function getQueue(email: string) {
  return buildOnboardingQueue(email);
}

export async function completeModule(email: string, input: CompleteModuleInput) {
  return completeOnboardingModule(email, input);
}

export async function skipModule(email: string, moduleId: OnboardingModuleId) {
  return skipOnboardingModule(email, moduleId);
}

export async function resetOnboarding(email: string) {
  await resetQueueState(email);
  return replayOnboarding(email);
}

export async function replayOnboarding(email: string) {
  await resetQueueState(email);
  return upsertQueueState(email, {
    completedSteps: ["account_created"],
    skippedSteps: [],
    currentStepId: "welcome",
    interruptedAt: new Date().toISOString(),
    version: 1,
  });
}

export async function listConfig(): Promise<OnboardingQueueConfigRow[]> {
  return fetchAllQueueConfig();
}

export async function updateConfig(
  moduleId: OnboardingModuleId,
  patch: Partial<Omit<OnboardingQueueConfigRow, "moduleId" | "updatedAt">>
) {
  return upsertQueueConfig(moduleId, patch);
}

export async function getDebugSnapshot(email: string) {
  const ctx = await buildEligibilityContext(email);
  const modules = QueueRegistry.list().map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    skippable: m.skippable ?? false,
  }));
  return { ctx, modules };
}

export async function revealMystery(email: string) {
  const result = await revealMysterySquarePass(email);
  await upsertAutomationState(email, {
    mysteryRevealedAt: new Date().toISOString(),
  });
  return result;
}

/** OnboardingQueueEngine™ — single source of truth for competitor onboarding. */
export const OnboardingQueueEngine = {
  getQueue,
  completeModule,
  skipModule,
  resetOnboarding,
  replayOnboarding,
  listConfig,
  updateConfig,
  getDebugSnapshot,
  revealMystery,
  ensureState: ensureQueueState,
};

export type OnboardingQueueEngineType = typeof OnboardingQueueEngine;
