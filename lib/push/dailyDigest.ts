import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";
import { getCurrentPickemContest } from "@/lib/pickem/db/contests";
import { listPickemGames } from "@/lib/pickem/db/games";
import { detectAutomationSlots } from "@/lib/platform/announcements/automation/detectSlots";
import { buildAutomatedAnnouncements } from "@/lib/platform/announcements/automation/templates";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  broadcastPushNotifications,
  type PushPayload,
} from "@/lib/push/send";
import {
  deletePushSubscriptionByEndpoint,
  getPushDigestSettings,
  listEnabledPushSubscriptions,
} from "@/lib/push/subscriptions";
import { getEasternDateParts } from "@/lib/platform/announcements/automation/time";

export interface DailyPushDigestResult {
  skipped: boolean;
  reason?: string;
  payload?: PushPayload;
  subscriberCount: number;
  successCount: number;
  failedCount: number;
  automationKey?: string;
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

function buildDailyPayload(now = new Date()): PushPayload {
  const et = getEasternDateParts(now);
  const dayKey = `${et.year}-${String(et.month).padStart(2, "0")}-${String(et.day).padStart(2, "0")}`;

  return {
    title: "SquareBoards",
    body: "Check today's games, picks, and live boards on SquareBoards.",
    url: "/my-games",
    tag: `daily-fallback-${dayKey}`,
  };
}

async function buildPayloadFromAutomation(now = new Date()): Promise<PushPayload | null> {
  const contest = await getCurrentPickemContest(DEFAULT_PICKEM_SPORT);
  const games = contest ? await listPickemGames(contest.id) : [];
  const hasActiveTiebreakers = contest
    ? await countActiveTiebreakers(contest.id)
    : false;

  const slots = detectAutomationSlots({ contest, games, hasActiveTiebreakers, now });
  if (!slots.length) {
    return buildDailyPayload(now);
  }

  const slot = slots[0];
  const drafts = buildAutomatedAnnouncements(slot);
  const card =
    drafts.find((d) => d.displayType === "notification_card") ??
    drafts.find((d) => d.displayType === "top_banner") ??
    drafts[0];

  if (!card) return buildDailyPayload(now);

  const et = getEasternDateParts(now);
  const dayKey = `${et.year}-${String(et.month).padStart(2, "0")}-${String(et.day).padStart(2, "0")}`;

  return {
    title: card.title,
    body: card.subtitle ?? "Open SquareBoards for today's action.",
    url: card.destinationHref ?? "/my-games",
    tag: `daily-${card.automationKey ?? slot.id}-${dayKey}`,
  };
}

async function alreadySentToday(automationKey: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("push_notification_log")
    .select("id", { count: "exact", head: true })
    .eq("automation_key", automationKey)
    .gte("created_at", startOfDayUtc.toISOString());

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function runDailyPushDigest(options?: {
  force?: boolean;
  sentBy?: string;
}): Promise<DailyPushDigestResult> {
  const settings = await getPushDigestSettings();
  if (!settings.dailyEnabled && !options?.force) {
    return { skipped: true, reason: "Daily push disabled.", subscriberCount: 0, successCount: 0, failedCount: 0 };
  }

  const now = new Date();
  const et = getEasternDateParts(now);
  if (!options?.force && et.hour !== settings.dailyHourEt) {
    return {
      skipped: true,
      reason: `Not scheduled hour (ET ${et.hour}, target ${settings.dailyHourEt}).`,
      subscriberCount: 0,
      successCount: 0,
      failedCount: 0,
    };
  }

  const payload = await buildPayloadFromAutomation(now);
  if (!payload) {
    return { skipped: true, reason: "No digest content.", subscriberCount: 0, successCount: 0, failedCount: 0 };
  }

  const automationKey = payload.tag ?? `daily-${et.year}-${et.month}-${et.day}`;
  if (!options?.force && (await alreadySentToday(automationKey))) {
    return {
      skipped: true,
      reason: "Already sent today.",
      subscriberCount: 0,
      successCount: 0,
      failedCount: 0,
      automationKey,
    };
  }

  const subscriptions = await listEnabledPushSubscriptions();
  if (!subscriptions.length) {
    return {
      skipped: true,
      reason: "No subscribers.",
      subscriberCount: 0,
      successCount: 0,
      failedCount: 0,
      automationKey,
      payload,
    };
  }

  const { success, failed } = await broadcastPushNotifications({
    subscriptions,
    payload,
    onExpired: deletePushSubscriptionByEndpoint,
  });

  const supabase = getSupabaseAdmin();
  await supabase.from("push_notification_log").insert({
    title: payload.title,
    body: payload.body,
    destination_url: payload.url ?? "/",
    source: "daily_automation",
    automation_key: automationKey,
    sent_by: options?.sentBy ?? "system",
    subscriber_count: subscriptions.length,
    success_count: success,
    failed_count: failed,
  });

  return {
    skipped: false,
    payload,
    subscriberCount: subscriptions.length,
    successCount: success,
    failedCount: failed,
    automationKey,
  };
}

export async function sendManualPushBroadcast(input: {
  title: string;
  body: string;
  url?: string;
  sentBy: string;
}): Promise<{ subscriberCount: number; successCount: number; failedCount: number }> {
  const subscriptions = await listEnabledPushSubscriptions();
  const payload: PushPayload = {
    title: input.title.trim(),
    body: input.body.trim(),
    url: input.url?.trim() || "/my-games",
    tag: `manual-${Date.now()}`,
  };

  const { success, failed } = await broadcastPushNotifications({
    subscriptions,
    payload,
    onExpired: deletePushSubscriptionByEndpoint,
  });

  const supabase = getSupabaseAdmin();
  await supabase.from("push_notification_log").insert({
    title: payload.title,
    body: payload.body,
    destination_url: payload.url ?? "/",
    source: "manual",
    sent_by: input.sentBy,
    subscriber_count: subscriptions.length,
    success_count: success,
    failed_count: failed,
  });

  return {
    subscriberCount: subscriptions.length,
    successCount: success,
    failedCount: failed,
  };
}
