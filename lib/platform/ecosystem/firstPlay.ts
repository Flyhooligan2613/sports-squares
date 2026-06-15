import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { computeInitialNextDropAt } from "@/lib/platform/ecosystem/weeklyDropSchedule";

export interface PlayerDropScheduleRow {
  firstPlayAt: string | null;
  nextWeeklyDropAt: string | null;
}

export async function getPlayerDropSchedule(email: string): Promise<PlayerDropScheduleRow> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("player_profiles")
    .select("first_play_at, next_weekly_drop_at")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  return {
    firstPlayAt: (data?.first_play_at as string | null) ?? null,
    nextWeeklyDropAt: (data?.next_weekly_drop_at as string | null) ?? null,
  };
}

/** Records the first square or Pick'em line — starts the 6-day drop timer. */
export async function recordFirstPlayIfNeeded(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("first_play_at")
    .eq("email", normalized)
    .maybeSingle();

  if (profile?.first_play_at) return false;

  const now = new Date();
  const nextAt = computeInitialNextDropAt(now);

  const { error } = await supabase
    .from("player_profiles")
    .update({
      first_play_at: now.toISOString(),
      next_weekly_drop_at: nextAt.toISOString(),
    })
    .eq("email", normalized)
    .is("first_play_at", null);

  if (error) throw error;
  return true;
}

export async function scheduleNextWeeklyDropAfterOpen(
  email: string,
  openedAt: Date
): Promise<void> {
  const { computeNextDropAfterOpen } = await import(
    "@/lib/platform/ecosystem/weeklyDropSchedule"
  );
  const supabase = getSupabaseAdmin();
  await supabase
    .from("player_profiles")
    .update({
      next_weekly_drop_at: computeNextDropAfterOpen(openedAt).toISOString(),
    })
    .eq("email", normalizeEmail(email));
}
