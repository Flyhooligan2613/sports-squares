import type { OnboardingEligibilityContext, OnboardingModule, OnboardingModuleId } from "./types";
import { CompletionTracker } from "./CompletionTracker";
import { QueueRegistry } from "./QueueRegistry";

function isModuleEnabled(
  module: OnboardingModule,
  ctx: OnboardingEligibilityContext
): boolean {
  const config = ctx.config.get(module.id);
  if (config && !config.enabled) return false;
  if (ctx.isLegacyAccount && module.id !== "daily_bonus" && module.id !== "flash_event") {
    if (
      [
        "welcome",
        "mystery_pass",
        "reward_reveal",
        "founder",
        "birthday",
        "season_event",
        "profile",
        "missions",
        "competitor_score",
        "choose_journey",
        "navigate_dashboard",
      ].includes(module.id)
    ) {
      return false;
    }
  }
  return true;
}

export async function isModuleEligible(
  module: OnboardingModule,
  ctx: OnboardingEligibilityContext
): Promise<boolean> {
  if (module.id === "account_created") return false;
  if (CompletionTracker.isFinished(module.id, ctx.state)) return false;
  if (!isModuleEnabled(module, ctx)) return false;
  return module.isEligible(ctx);
}

export async function resolveEligibleModules(
  ctx: OnboardingEligibilityContext
): Promise<OnboardingModule[]> {
  const eligible: OnboardingModule[] = [];
  for (const module of QueueRegistry.list()) {
    if (await isModuleEligible(module, ctx)) {
      eligible.push(module);
    }
  }
  return eligible;
}

export async function resolveNextModuleId(
  ctx: OnboardingEligibilityContext
): Promise<OnboardingModuleId | null> {
  if (ctx.state.onboardingComplete && !ctx.debugMode) {
    const engagement = QueueRegistry.list().filter((m) =>
      ["daily_bonus", "flash_event", "surprise"].includes(m.id)
    );
    for (const module of engagement) {
      if (await isModuleEligible(module, ctx)) return module.id;
    }
    return null;
  }

  for (const module of QueueRegistry.list()) {
    if (await isModuleEligible(module, ctx)) return module.id;
  }
  return null;
}

export async function arePriorStepsResolved(
  moduleId: OnboardingModuleId,
  ctx: OnboardingEligibilityContext
): Promise<boolean> {
  for (const module of QueueRegistry.list()) {
    if (module.id === moduleId) break;
    if (module.id === "account_created") continue;
    if (CompletionTracker.isFinished(module.id, ctx.state)) continue;
    if (await isModuleEligible(module, ctx)) return false;
  }
  return true;
}

export const EligibilityResolver = {
  isEligible: isModuleEligible,
  resolveEligible: resolveEligibleModules,
  resolveNext: resolveNextModuleId,
  arePriorStepsResolved,
};
