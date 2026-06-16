import {
  fetchAccountAgeHours,
  fetchAutomationState,
  upsertAutomationState,
} from "./repository";
import {
  AUTOMATION_LEGACY_SKIP_HOURS,
  FOUNDING_COMPETITOR_LIMIT,
} from "./config";
import type { SquarePassAutomationState, SquarePassExperienceId } from "./types";
import { getActiveFlashEvents } from "./FlashEventService";
import { isFounderEligible } from "./FounderRecognitionService";
import { isDailyBonusAvailable } from "./DailyBonusService";
import { GenesisEngine } from "@/lib/platform/engines/genesis/GenesisEngine";

export interface EligibilityContext {
  state: SquarePassAutomationState;
  accountAgeHours: number;
  isLegacyAccount: boolean;
  founderEligible: boolean;
  dailyBonusAvailable: boolean;
  flashEvents: Awaited<ReturnType<typeof getActiveFlashEvents>>;
  rookieSeasonActive: boolean;
}

export async function buildEligibilityContext(email: string): Promise<EligibilityContext> {
  const state = await ensureAutomationState(email);
  const accountAgeHours = (await fetchAccountAgeHours(email)) ?? 0;
  const isLegacyAccount = accountAgeHours > AUTOMATION_LEGACY_SKIP_HOURS;

  const [founderEligible, dailyBonusAvailable, flashEvents, genesisProgress] =
    await Promise.all([
      isFounderEligible(email, state).catch(() => false),
      isDailyBonusAvailable(email, state).catch(() => false),
      getActiveFlashEvents(email, state).catch(() => []),
      GenesisEngine.getProgress(email).catch(() => null),
    ]);

  return {
    state,
    accountAgeHours,
    isLegacyAccount,
    founderEligible,
    dailyBonusAvailable,
    flashEvents,
    rookieSeasonActive: Boolean(genesisProgress?.rookieSeason.active),
  };
}

export async function ensureAutomationState(email: string): Promise<SquarePassAutomationState> {
  let state = await fetchAutomationState(email);
  if (state) return state;

  const accountAgeHours = (await fetchAccountAgeHours(email)) ?? 0;
  const isLegacy = accountAgeHours > AUTOMATION_LEGACY_SKIP_HOURS;
  const now = isLegacy ? new Date().toISOString() : null;

  state = await upsertAutomationState(email, {
    welcomeCompletedAt: now,
    mysteryRevealedAt: now,
    rewardRevealCompletedAt: now,
    whatsNextCompletedAt: now,
    profileCustomizationCompletedAt: now,
    founderClaimedAt: null,
    lastDailyBonusAt: null,
    flashEventsSeen: [],
    surprisesClaimed: [],
    experiencesCompleted: isLegacy
      ? ["welcome", "mystery", "reward_reveal", "whats_next", "profile_customization"]
      : [],
  });

  return state;
}

export function isExperienceEligible(
  id: SquarePassExperienceId,
  ctx: EligibilityContext
): boolean {
  const { state, isLegacyAccount } = ctx;

  switch (id) {
    case "welcome":
      return !isLegacyAccount && !state.welcomeCompletedAt;
    case "mystery":
      return !isLegacyAccount && !state.mysteryRevealedAt;
    case "reward_reveal":
      return !isLegacyAccount && !state.rewardRevealCompletedAt;
    case "founder":
      return ctx.founderEligible && !state.founderClaimedAt;
    case "whats_next":
      return !isLegacyAccount && !state.whatsNextCompletedAt && ctx.rookieSeasonActive;
    case "profile_customization":
      return !isLegacyAccount && !state.profileCustomizationCompletedAt;
    case "daily_bonus":
      return state.welcomeCompletedAt != null && ctx.dailyBonusAvailable;
    case "flash_event":
      return ctx.flashEvents.length > 0;
    case "surprise":
      return (
        state.welcomeCompletedAt != null &&
        !isLegacyAccount &&
        ctx.accountAgeHours >= 1 &&
        ctx.accountAgeHours <= 72 &&
        !state.surprisesClaimed.includes("rookie_surprise_day1")
      );
    default:
      return false;
  }
}

export { FOUNDING_COMPETITOR_LIMIT };
