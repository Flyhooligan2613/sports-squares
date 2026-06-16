import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  SquarePassAutomationState,
  SquarePassMysteryPoolEntry,
} from "./types";
import type { SquarePassRewardDef } from "../types";

function mapState(row: Record<string, unknown>): SquarePassAutomationState {
  return {
    email: row.email as string,
    welcomeCompletedAt: (row.welcome_completed_at as string | null) ?? null,
    mysteryRevealedAt: (row.mystery_revealed_at as string | null) ?? null,
    rewardRevealCompletedAt: (row.reward_reveal_completed_at as string | null) ?? null,
    founderClaimedAt: (row.founder_claimed_at as string | null) ?? null,
    whatsNextCompletedAt: (row.whats_next_completed_at as string | null) ?? null,
    profileCustomizationCompletedAt:
      (row.profile_customization_completed_at as string | null) ?? null,
    lastDailyBonusAt: (row.last_daily_bonus_at as string | null) ?? null,
    flashEventsSeen: (row.flash_events_seen as string[]) ?? [],
    surprisesClaimed: (row.surprises_claimed as string[]) ?? [],
    experiencesCompleted: (row.experiences_completed as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPoolEntry(row: Record<string, unknown>): SquarePassMysteryPoolEntry {
  return {
    id: row.id as string,
    slug: row.slug as string,
    label: row.label as string,
    reward: row.reward as SquarePassRewardDef,
    weight: Number(row.weight ?? 100),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export async function fetchAutomationState(
  email: string
): Promise<SquarePassAutomationState | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_automation_state")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data ? mapState(data as Record<string, unknown>) : null;
}

export async function upsertAutomationState(
  email: string,
  patch: Partial<
    Omit<SquarePassAutomationState, "email" | "createdAt" | "updatedAt">
  >
): Promise<SquarePassAutomationState> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();

  const row: Record<string, unknown> = { email: normalized, updated_at: now };
  if (patch.welcomeCompletedAt !== undefined) row.welcome_completed_at = patch.welcomeCompletedAt;
  if (patch.mysteryRevealedAt !== undefined) row.mystery_revealed_at = patch.mysteryRevealedAt;
  if (patch.rewardRevealCompletedAt !== undefined) {
    row.reward_reveal_completed_at = patch.rewardRevealCompletedAt;
  }
  if (patch.founderClaimedAt !== undefined) row.founder_claimed_at = patch.founderClaimedAt;
  if (patch.whatsNextCompletedAt !== undefined) {
    row.whats_next_completed_at = patch.whatsNextCompletedAt;
  }
  if (patch.profileCustomizationCompletedAt !== undefined) {
    row.profile_customization_completed_at = patch.profileCustomizationCompletedAt;
  }
  if (patch.lastDailyBonusAt !== undefined) row.last_daily_bonus_at = patch.lastDailyBonusAt;
  if (patch.flashEventsSeen !== undefined) row.flash_events_seen = patch.flashEventsSeen;
  if (patch.surprisesClaimed !== undefined) row.surprises_claimed = patch.surprisesClaimed;
  if (patch.experiencesCompleted !== undefined) {
    row.experiences_completed = patch.experiencesCompleted;
  }

  const { data, error } = await supabase
    .from("square_pass_automation_state")
    .upsert(row, { onConflict: "email" })
    .select("*")
    .single();
  if (error) throw error;
  return mapState(data as Record<string, unknown>);
}

export async function fetchActiveMysteryPool(): Promise<SquarePassMysteryPoolEntry[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("square_pass_mystery_pool")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapPoolEntry(row as Record<string, unknown>));
}

export async function countPlayerProfiles(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("player_profiles")
    .select("email", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function fetchPlayerRegistrationOrder(email: string): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const { data: profile } = await supabase
    .from("player_profiles")
    .select("created_at")
    .eq("email", normalized)
    .maybeSingle();
  if (!profile?.created_at) return null;

  const { count, error } = await supabase
    .from("player_profiles")
    .select("email", { count: "exact", head: true })
    .lte("created_at", profile.created_at as string);
  if (error) throw error;
  return count ?? null;
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
