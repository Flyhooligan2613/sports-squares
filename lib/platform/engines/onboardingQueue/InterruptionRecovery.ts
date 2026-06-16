import type { OnboardingEligibilityContext, OnboardingModuleId, OnboardingQueueState } from "./types";
import { MANDATORY_ONBOARDING_ORDER } from "./config";
import { CompletionTracker } from "./CompletionTracker";
import { EligibilityResolver } from "./EligibilityResolver";

export function recoverInterruptedStep(state: OnboardingQueueState): OnboardingModuleId | null {
  if (state.interruptedAt && state.currentStepId) {
    if (!CompletionTracker.isFinished(state.currentStepId, state)) {
      return state.currentStepId;
    }
  }
  return null;
}

export async function resolveResumeStepId(
  ctx: OnboardingEligibilityContext
): Promise<OnboardingModuleId | null> {
  const interrupted = recoverInterruptedStep(ctx.state);
  if (interrupted) return interrupted;

  for (const stepId of MANDATORY_ONBOARDING_ORDER) {
    if (CompletionTracker.isFinished(stepId, ctx.state)) continue;
    const module = ctx.state.completedSteps.includes(stepId) ? null : stepId;
    if (module) {
      return stepId;
    }
  }

  return EligibilityResolver.resolveNext(ctx);
}

export function markInterrupted(
  state: OnboardingQueueState,
  stepId: OnboardingModuleId
): OnboardingQueueState {
  return {
    ...state,
    currentStepId: stepId,
    interruptedAt: new Date().toISOString(),
  };
}

export const InterruptionRecovery = {
  recoverInterruptedStep,
  resolveResumeStepId,
  markInterrupted,
};
