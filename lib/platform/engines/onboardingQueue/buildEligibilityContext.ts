import {
  ONBOARDING_LEGACY_SKIP_HOURS,
  ONBOARDING_QUEUE_DEBUG,
} from "./config";
import {
  fetchAccountAgeHours,
  fetchAllQueueConfig,
  fetchQueueState,
} from "./repository";
import { ensureQueueState } from "./ensureQueueState";
import type { OnboardingEligibilityContext, OnboardingQueueConfigRow } from "./types";
import { isDailyBonusAvailable } from "@/lib/platform/engines/squarePass/automation/DailyBonusService";
import { getActiveFlashEvents } from "@/lib/platform/engines/squarePass/automation/FlashEventService";
import { isFounderEligible } from "@/lib/platform/engines/squarePass/automation/FounderRecognitionService";
import { fetchAutomationState } from "@/lib/platform/engines/squarePass/automation/repository";
import { GenesisEngine } from "@/lib/platform/engines/genesis/GenesisEngine";

function isBirthdayToday(accountCreatedAt: string | null): boolean {
  if (!accountCreatedAt) return false;
  const created = new Date(accountCreatedAt);
  const now = new Date();
  return (
    created.getUTCMonth() === now.getUTCMonth() && created.getUTCDate() === now.getUTCDate()
  );
}

export async function buildEligibilityContext(email: string): Promise<OnboardingEligibilityContext> {
  const state = await ensureQueueState(email);
  const configRows = await fetchAllQueueConfig();
  const config = new Map(
    configRows.map((row) => [row.moduleId, row] as const)
  );

  const accountAgeHours = (await fetchAccountAgeHours(email)) ?? 0;
  const isLegacyAccount = accountAgeHours > ONBOARDING_LEGACY_SKIP_HOURS;
  const automationState = await fetchAutomationState(email);
  const supabaseAdmin = await import("@/lib/supabase/admin");
  let accountCreatedAt: string | null = null;
  if (supabaseAdmin.isSupabaseAdminConfigured()) {
    const { getSupabaseAdmin } = supabaseAdmin;
    const { data } = await getSupabaseAdmin()
      .from("player_profiles")
      .select("created_at")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    accountCreatedAt = (data?.created_at as string | null) ?? null;
  }

  const [founderEligible, dailyBonusAvailable, flashEvents, genesisProgress] =
    await Promise.all([
      automationState
        ? isFounderEligible(email, automationState).catch(() => false)
        : Promise.resolve(false),
      automationState
        ? isDailyBonusAvailable(email, automationState).catch(() => false)
        : Promise.resolve(false),
      automationState
        ? getActiveFlashEvents(email, automationState).catch(() => [])
        : Promise.resolve([]),
      GenesisEngine.getProgress(email).catch(() => null),
    ]);

  const testingMode = configRows.some((row) => row.testingMode);
  const debugMode = ONBOARDING_QUEUE_DEBUG || testingMode;

  const birthdayConfig = config.get("birthday")?.eligibilityJson;
  const forceBirthday = birthdayConfig?.forceEligible === true || debugMode;

  return {
    email,
    state,
    config,
    accountAgeHours,
    isLegacyAccount,
    founderEligible,
    dailyBonusAvailable,
    flashEvents,
    rookieSeasonActive: Boolean(genesisProgress?.rookieSeason.active),
    isBirthdayToday: forceBirthday || isBirthdayToday(accountCreatedAt),
    seasonEventActive: Boolean(genesisProgress?.rookieSeason.active),
    debugMode,
  };
}

export async function getQueueStateForAdmin(email: string) {
  return fetchQueueState(email);
}
