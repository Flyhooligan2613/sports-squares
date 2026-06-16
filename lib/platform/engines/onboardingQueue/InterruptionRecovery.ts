import type { OnboardingEligibilityContext, OnboardingModuleId, OnboardingQueueState } from "./types";
import { CompletionTracker } from "./CompletionTracker";
import { EligibilityResolver } from "./EligibilityResolver";
import { QueueRegistry } from "./QueueRegistry";

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
  if (interrupted) {
    const module = QueueRegistry.get(interrupted);
    if (module && (await EligibilityResolver.isEligible(module, ctx))) {
      return interrupted;
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
