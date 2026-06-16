/** Optional Command Center adapter — automation completion rates. */
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export interface AutomationCompletionStats {
  totalStates: number;
  welcomeCompleted: number;
  mysteryRevealed: number;
  founderClaimed: number;
  dailyBonusToday: number;
  dataGaps: string[];
}

export async function fetchAutomationCompletionStats(): Promise<AutomationCompletionStats> {
  const dataGaps: string[] = [];

  if (!isSupabaseAdminConfigured()) {
    return {
      totalStates: 0,
      welcomeCompleted: 0,
      mysteryRevealed: 0,
      founderClaimed: 0,
      dailyBonusToday: 0,
      dataGaps: ["Supabase admin not configured."],
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [total, welcome, mystery, founder, daily] = await Promise.all([
      supabase
        .from("square_pass_automation_state")
        .select("email", { count: "exact", head: true }),
      supabase
        .from("square_pass_automation_state")
        .select("email", { count: "exact", head: true })
        .not("welcome_completed_at", "is", null),
      supabase
        .from("square_pass_automation_state")
        .select("email", { count: "exact", head: true })
        .not("mystery_revealed_at", "is", null),
      supabase
        .from("square_pass_automation_state")
        .select("email", { count: "exact", head: true })
        .not("founder_claimed_at", "is", null),
      supabase
        .from("square_pass_automation_state")
        .select("email", { count: "exact", head: true })
        .gte("last_daily_bonus_at", today.toISOString()),
    ]);

    return {
      totalStates: total.count ?? 0,
      welcomeCompleted: welcome.count ?? 0,
      mysteryRevealed: mystery.count ?? 0,
      founderClaimed: founder.count ?? 0,
      dailyBonusToday: daily.count ?? 0,
      dataGaps,
    };
  } catch {
    dataGaps.push("Automation tables unavailable — run migration 056.");
    return {
      totalStates: 0,
      welcomeCompleted: 0,
      mysteryRevealed: 0,
      founderClaimed: 0,
      dailyBonusToday: 0,
      dataGaps,
    };
  }
}
