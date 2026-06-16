import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  OnboardingModuleId,
  OnboardingQueueConfigRow,
  OnboardingQueueState,
} from "./types";
import { MANDATORY_ONBOARDING_ORDER, ONBOARDING_QUEUE_VERSION } from "./config";

function mapState(row: Record<string, unknown>): OnboardingQueueState {
  const completed = (row.completed_steps as OnboardingModuleId[]) ?? [];
  const onboardingComplete = completed.includes("navigate_dashboard");

  return {
    email: row.email as string,
    currentStepId: (row.current_step_id as OnboardingModuleId | null) ?? null,
    completedSteps: completed,
    skippedSteps: (row.skipped_steps as OnboardingModuleId[]) ?? [],
    interruptedAt: (row.interrupted_at as string | null) ?? null,
    version: Number(row.version ?? ONBOARDING_QUEUE_VERSION),
    onboardingComplete,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapConfig(row: Record<string, unknown>): OnboardingQueueConfigRow {
  return {
    moduleId: row.module_id as OnboardingModuleId,
    enabled: Boolean(row.enabled ?? true),
    orderOverride: row.order_override != null ? Number(row.order_override) : null,
    delayMs: Number(row.delay_ms ?? 0),
    eligibilityJson: (row.eligibility_json as Record<string, unknown>) ?? {},
    testingMode: Boolean(row.testing_mode ?? false),
    updatedAt: row.updated_at as string,
  };
}

export async function fetchQueueState(email: string): Promise<OnboardingQueueState | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("onboarding_queue_state")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data ? mapState(data as Record<string, unknown>) : null;
}

export async function upsertQueueState(
  email: string,
  patch: Partial<
    Omit<OnboardingQueueState, "email" | "createdAt" | "updatedAt" | "onboardingComplete">
  >
): Promise<OnboardingQueueState> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();

  const row: Record<string, unknown> = { email: normalized, updated_at: now };
  if (patch.currentStepId !== undefined) row.current_step_id = patch.currentStepId;
  if (patch.completedSteps !== undefined) row.completed_steps = patch.completedSteps;
  if (patch.skippedSteps !== undefined) row.skipped_steps = patch.skippedSteps;
  if (patch.interruptedAt !== undefined) row.interrupted_at = patch.interruptedAt;
  if (patch.version !== undefined) row.version = patch.version;

  const { data, error } = await supabase
    .from("onboarding_queue_state")
    .upsert(row, { onConflict: "email" })
    .select("*")
    .single();
  if (error) throw error;
  return mapState(data as Record<string, unknown>);
}

export async function fetchAllQueueConfig(): Promise<OnboardingQueueConfigRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("onboarding_queue_config")
    .select("*")
    .order("order_override", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapConfig(row as Record<string, unknown>));
}

export async function upsertQueueConfig(
  moduleId: OnboardingModuleId,
  patch: Partial<
    Omit<OnboardingQueueConfigRow, "moduleId" | "updatedAt">
  >
): Promise<OnboardingQueueConfigRow> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    module_id: moduleId,
    updated_at: now,
  };
  if (patch.enabled !== undefined) row.enabled = patch.enabled;
  if (patch.orderOverride !== undefined) row.order_override = patch.orderOverride;
  if (patch.delayMs !== undefined) row.delay_ms = patch.delayMs;
  if (patch.eligibilityJson !== undefined) row.eligibility_json = patch.eligibilityJson;
  if (patch.testingMode !== undefined) row.testing_mode = patch.testingMode;

  const { data, error } = await supabase
    .from("onboarding_queue_config")
    .upsert(row, { onConflict: "module_id" })
    .select("*")
    .single();
  if (error) throw error;
  return mapConfig(data as Record<string, unknown>);
}

export async function resetQueueState(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const { error } = await supabase.from("onboarding_queue_state").delete().eq("email", normalized);
  if (error) throw error;
}

/** Migrate legacy square_pass_automation_state into onboarding_queue_state. */
export async function migrateFromAutomationState(email: string): Promise<OnboardingQueueState | null> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const { data: legacy } = await supabase
    .from("square_pass_automation_state")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (!legacy) return null;

  const completed: OnboardingModuleId[] = ["account_created"];
  const mapLegacy: Array<[string | null, OnboardingModuleId]> = [
    [legacy.welcome_completed_at as string | null, "welcome"],
    [legacy.mystery_revealed_at as string | null, "mystery_pass"],
    [legacy.reward_reveal_completed_at as string | null, "reward_reveal"],
    [legacy.founder_claimed_at as string | null, "founder"],
    [legacy.profile_customization_completed_at as string | null, "profile"],
    [legacy.whats_next_completed_at as string | null, "missions"],
  ];
  for (const [ts, id] of mapLegacy) {
    if (ts) completed.push(id);
  }

  const experiences = (legacy.experiences_completed as string[]) ?? [];
  if (experiences.includes("competitor_score")) completed.push("competitor_score");
  if (experiences.includes("choose_journey")) completed.push("choose_journey");
  if (experiences.includes("navigate_dashboard")) completed.push("navigate_dashboard");
  if (experiences.includes("birthday")) completed.push("birthday");
  if (experiences.includes("season_event")) completed.push("season_event");

  const uniqueCompleted = Array.from(new Set(completed));
  let currentStepId: OnboardingModuleId | null = null;
  for (const stepId of MANDATORY_ONBOARDING_ORDER) {
    if (!uniqueCompleted.includes(stepId)) {
      currentStepId = stepId;
      break;
    }
  }

  return upsertQueueState(normalized, {
    completedSteps: uniqueCompleted,
    skippedSteps: [],
    currentStepId,
    interruptedAt: null,
    version: ONBOARDING_QUEUE_VERSION,
  });
}

export async function fetchAccountAgeHours(email: string): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("player_profiles")
    .select("created_at")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (!data?.created_at) return null;
  return (Date.now() - new Date(data.created_at as string).getTime()) / 3_600_000;
}
