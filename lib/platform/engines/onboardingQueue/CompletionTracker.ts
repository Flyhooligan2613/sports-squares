import type {
  OnboardingCompletionStatus,
  OnboardingModuleId,
  OnboardingQueueState,
} from "./types";

export function getModuleStatus(
  moduleId: OnboardingModuleId,
  state: OnboardingQueueState
): OnboardingCompletionStatus {
  if (state.completedSteps.includes(moduleId)) return "completed";
  if (state.skippedSteps.includes(moduleId)) return "skipped";
  if (state.currentStepId === moduleId && state.interruptedAt) return "pending";
  return "pending";
}

export function isModuleFinished(
  moduleId: OnboardingModuleId,
  state: OnboardingQueueState
): boolean {
  return state.completedSteps.includes(moduleId) || state.skippedSteps.includes(moduleId);
}

export function markModuleCompleted(
  state: OnboardingQueueState,
  moduleId: OnboardingModuleId
): OnboardingQueueState {
  const completedSteps = state.completedSteps.includes(moduleId)
    ? state.completedSteps
    : [...state.completedSteps, moduleId];
  return {
    ...state,
    completedSteps,
    currentStepId: null,
    interruptedAt: null,
    onboardingComplete: completedSteps.includes("navigate_dashboard"),
  };
}

export function markModuleSkipped(
  state: OnboardingQueueState,
  moduleId: OnboardingModuleId
): OnboardingQueueState {
  const skippedSteps = state.skippedSteps.includes(moduleId)
    ? state.skippedSteps
    : [...state.skippedSteps, moduleId];
  return {
    ...state,
    skippedSteps,
    currentStepId: null,
    interruptedAt: null,
  };
}

export function markModuleUnavailable(
  state: OnboardingQueueState,
  moduleId: OnboardingModuleId
): OnboardingQueueState {
  return markModuleSkipped(state, moduleId);
}

export const CompletionTracker = {
  getStatus: getModuleStatus,
  isFinished: isModuleFinished,
  markCompleted: markModuleCompleted,
  markSkipped: markModuleSkipped,
  markUnavailable: markModuleUnavailable,
};
