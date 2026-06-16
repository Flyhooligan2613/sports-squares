import { ONBOARDING_QUEUE_DEBUG } from "./config";
import { CompletionTracker } from "./CompletionTracker";
import { EligibilityResolver } from "./EligibilityResolver";
import { InterruptionRecovery } from "./InterruptionRecovery";
import { QueueRegistry } from "./QueueRegistry";
import { ensureQueueState } from "./ensureQueueState";
import { upsertQueueState } from "./repository";
import { syncAutomationStateFromQueue } from "./syncAutomationState";
import type {
  CompleteModuleInput,
  OnboardingEligibilityContext,
  OnboardingModuleId,
  OnboardingQueueResult,
  OnboardingQueueStep,
} from "./types";
import { buildEligibilityContext } from "./buildEligibilityContext";

async function buildStep(
  moduleId: OnboardingModuleId,
  ctx: OnboardingEligibilityContext
): Promise<OnboardingQueueStep | null> {
  const module = QueueRegistry.get(moduleId);
  if (!module) return null;
  const payload = module.buildPayload ? await module.buildPayload(ctx) : undefined;
  return {
    id: module.id,
    title: module.title,
    order: module.order,
    skippable: module.skippable ?? false,
    payload,
  };
}

export async function buildOnboardingQueue(email: string): Promise<OnboardingQueueResult> {
  const ctx = await buildEligibilityContext(email);
  const resumeId = await InterruptionRecovery.resolveResumeStepId(ctx);
  const eligible = await EligibilityResolver.resolveEligible(ctx);

  const queue: OnboardingQueueStep[] = [];
  for (const module of eligible) {
    const step = await buildStep(module.id, ctx);
    if (step) queue.push(step);
  }

  const nextId = resumeId ?? queue[0]?.id ?? null;
  let nextModule: OnboardingQueueStep | null = null;
  if (nextId) {
    const module = QueueRegistry.get(nextId);
    if (module && (await EligibilityResolver.isEligible(module, ctx))) {
      nextModule = await buildStep(nextId, ctx);
    }
  }

  if (nextModule?.id && ctx.state.currentStepId !== nextModule.id) {
    ctx.state = await upsertQueueState(email, {
      currentStepId: nextModule.id,
      interruptedAt: new Date().toISOString(),
    });
  }

  return {
    queue,
    state: ctx.state,
    nextModule,
    debugMode: ctx.debugMode,
  };
}

export async function completeOnboardingModule(
  email: string,
  input: CompleteModuleInput
): Promise<{ ok: true; nextModule: OnboardingQueueStep | null }> {
  const ctx = await buildEligibilityContext(email);
  const module = QueueRegistry.get(input.moduleId);
  if (!module) throw new Error("Unknown module.");

  if (module.onComplete) {
    await module.onComplete(ctx, input.metadata);
  }

  let state = CompletionTracker.markCompleted(ctx.state, input.moduleId);
  state = await upsertQueueState(email, {
    completedSteps: state.completedSteps,
    currentStepId: null,
    interruptedAt: null,
  });

  await syncAutomationStateFromQueue(email, input.moduleId, input.metadata);

  const nextCtx = { ...ctx, state };
  const nextId = await EligibilityResolver.resolveNext(nextCtx);
  if (nextId) {
    state = await upsertQueueState(email, {
      currentStepId: nextId,
      interruptedAt: new Date().toISOString(),
    });
  }

  const nextModule = nextId ? await buildStep(nextId, { ...nextCtx, state }) : null;
  return { ok: true, nextModule };
}

export async function skipOnboardingModule(
  email: string,
  moduleId: OnboardingModuleId
): Promise<{ ok: true; nextModule: OnboardingQueueStep | null }> {
  const ctx = await buildEligibilityContext(email);
  const module = QueueRegistry.get(moduleId);
  if (!module?.skippable) throw new Error("Module cannot be skipped.");

  if (module.onSkip) await module.onSkip(ctx);

  let state = CompletionTracker.markSkipped(ctx.state, moduleId);
  state = await upsertQueueState(email, {
    skippedSteps: state.skippedSteps,
    currentStepId: null,
    interruptedAt: null,
  });

  const nextCtx = { ...ctx, state };
  const nextId = await EligibilityResolver.resolveNext(nextCtx);
  if (nextId) {
    state = await upsertQueueState(email, {
      currentStepId: nextId,
      interruptedAt: new Date().toISOString(),
    });
  }

  const nextModule = nextId ? await buildStep(nextId, { ...nextCtx, state }) : null;
  return { ok: true, nextModule };
}

export const QueueExecutor = {
  buildQueue: buildOnboardingQueue,
  complete: completeOnboardingModule,
  skip: skipOnboardingModule,
  ensureState: ensureQueueState,
};

export { ONBOARDING_QUEUE_DEBUG, buildEligibilityContext };
export { fetchAllQueueConfig, resetQueueState, upsertQueueConfig } from "./repository";
