import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { getCurrentPickemContest } from "@/lib/pickem/db/contests";
import { listPickemGames } from "@/lib/pickem/db/games";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";
import {
  deactivateAutomatedAnnouncementsExcept,
  upsertAutomatedAnnouncement,
} from "@/lib/platform/announcements/db";
import { detectAutomationSlots } from "@/lib/platform/announcements/automation/detectSlots";
import { buildAutomatedAnnouncements } from "@/lib/platform/announcements/automation/templates";

export interface AnnouncementAutomationResult {
  slotsDetected: number;
  published: number;
  deactivated: number;
  activeKeys: string[];
  slotIds: string[];
}

async function countActiveTiebreakers(contestId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("pickem_leagues")
    .select("id", { count: "exact", head: true })
    .eq("contest_id", contestId)
    .eq("resolution_status", "tiebreaker_active");

  if (error) return false;
  return (count ?? 0) > 0;
}

/**
 * Detect NFL calendar context and upsert platform announcements automatically.
 * Idempotent via automation_key — safe to run every hour.
 */
export async function runAnnouncementAutomation(): Promise<AnnouncementAutomationResult> {
  const contest = await getCurrentPickemContest(DEFAULT_PICKEM_SPORT);
  const games = contest ? await listPickemGames(contest.id) : [];
  const hasActiveTiebreakers = contest
    ? await countActiveTiebreakers(contest.id)
    : false;

  const slots = detectAutomationSlots({
    contest,
    games,
    hasActiveTiebreakers,
  });

  const activeKeys: string[] = [];
  let published = 0;

  for (const slot of slots) {
    const drafts = buildAutomatedAnnouncements(slot);
    for (const draft of drafts) {
      await upsertAutomatedAnnouncement({
        automationKey: draft.automationKey,
        payload: draft,
      });
      activeKeys.push(draft.automationKey);
      published += 1;
    }
  }

  const deactivated = await deactivateAutomatedAnnouncementsExcept(activeKeys);

  if (published > 0 || deactivated > 0) {
    await logPlatformAudit({
      eventType: "automation.cron",
      summary: `Announcement automation: ${published} active, ${deactivated} deactivated`,
      gameType: "platform",
      actorRole: "system",
      metadata: {
        slots: slots.map((s) => s.id),
        activeKeys,
        deactivated,
      },
    });
  }

  return {
    slotsDetected: slots.length,
    published,
    deactivated,
    activeKeys,
    slotIds: slots.map((s) => s.id),
  };
}
