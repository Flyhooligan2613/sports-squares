import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export interface PushSubscriptionRow {
  id: string;
  email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  platform: string;
  enabled: boolean;
}

function mapRow(row: Record<string, unknown>): PushSubscriptionRow {
  return {
    id: row.id as string,
    email: row.email as string,
    endpoint: row.endpoint as string,
    p256dh: row.p256dh as string,
    auth: row.auth as string,
    userAgent: (row.user_agent as string | null) ?? null,
    platform: (row.platform as string) ?? "web",
    enabled: Boolean(row.enabled),
  };
}

export async function upsertPushSubscription(input: {
  email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("player_push_subscriptions").upsert(
    {
      email: normalizeEmail(input.email),
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent ?? null,
      platform: "web",
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
}

export async function disablePushSubscription(
  email: string,
  endpoint: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("player_push_subscriptions")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email))
    .eq("endpoint", endpoint);
  if (error) throw error;
}

export async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("player_push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function listEnabledPushSubscriptions(): Promise<PushSubscriptionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_push_subscriptions")
    .select("*")
    .eq("enabled", true);

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function countPushSubscribers(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("player_push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("enabled", true);

  if (error) throw error;
  return count ?? 0;
}

export async function listPlayerPushSubscriptions(
  email: string
): Promise<PushSubscriptionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_push_subscriptions")
    .select("*")
    .eq("email", normalizeEmail(email));

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function setPlayerPushEnabled(
  email: string,
  enabled: boolean
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("player_push_subscriptions")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email));
  if (error) throw error;
}

export async function getPushDigestSettings(): Promise<{
  dailyEnabled: boolean;
  dailyHourEt: number;
}> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("push_digest_settings")
    .select("daily_enabled, daily_hour_et")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw error;
  return {
    dailyEnabled: Boolean(data?.daily_enabled ?? true),
    dailyHourEt: Number(data?.daily_hour_et ?? 9),
  };
}

export async function updatePushDigestSettings(input: {
  dailyEnabled: boolean;
  dailyHourEt: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("push_digest_settings").upsert(
    {
      id: "default",
      daily_enabled: input.dailyEnabled,
      daily_hour_et: input.dailyHourEt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}
