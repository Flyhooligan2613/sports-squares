import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getFinancialStatusOverview } from "@/lib/platform/core/financialStatus";
import { fetchDashboardStats } from "../adapters/statsAdapter";
import type { CommandCenterAlert, CommandCenterDashboardStats } from "../types";

function mapAlertRow(row: Record<string, unknown>): CommandCenterAlert {
  return {
    id: row.id as string,
    alertKey: row.alert_key as string,
    title: row.title as string,
    message: row.message as string,
    severity: row.severity as CommandCenterAlert["severity"],
    category: row.category as CommandCenterAlert["category"],
    enabled: row.enabled as boolean,
    thresholdConfig: (row.threshold_config as Record<string, unknown>) ?? {},
    lastTriggeredAt: (row.last_triggered_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listCommandCenterAlerts(
  dashboardStats?: CommandCenterDashboardStats | null
): Promise<CommandCenterAlert[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("command_center_alerts")
    .select("*")
    .order("severity", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("[command_center_alerts]", error.message);
    return [];
  }

  const alerts = (data ?? []).map((row) => mapAlertRow(row as Record<string, unknown>));
  return evaluateAlerts(alerts, dashboardStats);
}

export async function updateCommandCenterAlert(input: {
  id: string;
  enabled?: boolean;
  thresholdConfig?: Record<string, unknown>;
}): Promise<CommandCenterAlert | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.enabled === "boolean") patch.enabled = input.enabled;
  if (input.thresholdConfig) patch.threshold_config = input.thresholdConfig;

  const { data, error } = await supabase
    .from("command_center_alerts")
    .update(patch)
    .eq("id", input.id)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  const [evaluated] = await evaluateAlerts([mapAlertRow(data as Record<string, unknown>)]);
  return evaluated ?? null;
}

async function evaluateAlerts(
  alerts: CommandCenterAlert[],
  preloadedStats?: CommandCenterDashboardStats | null
): Promise<CommandCenterAlert[]> {
  if (!isSupabaseAdminConfigured()) return alerts;

  const supabase = getSupabaseAdmin();
  const since1h = new Date(Date.now() - 60 * 60_000).toISOString();

  const [failedPaymentsRes, highSupportRes, financialOverview, dashboardStats] =
    await Promise.all([
      supabase
        .from("payment_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", since1h),
      supabase
        .from("support_threads")
        .select("id", { count: "exact", head: true })
        .eq("priority", "high")
        .neq("status", "resolved"),
      getFinancialStatusOverview().catch(() => null),
      preloadedStats !== undefined
        ? Promise.resolve(preloadedStats)
        : fetchDashboardStats().catch(() => null),
    ]);

  return alerts.map((alert) => {
    let triggered = false;

    if (alert.alertKey === "payment.failed_spike" && alert.enabled) {
      const threshold = Number(alert.thresholdConfig.threshold ?? 5);
      triggered = (failedPaymentsRes.count ?? 0) >= threshold;
    }

    if (alert.alertKey === "support.high_priority_backlog" && alert.enabled) {
      const threshold = Number(alert.thresholdConfig.threshold ?? 10);
      triggered = (highSupportRes.count ?? 0) >= threshold;
    }

    if (alert.alertKey === "system.webhook_failures" && alert.enabled && financialOverview) {
      const threshold = Number(alert.thresholdConfig.threshold ?? 3);
      triggered = financialOverview.webhookEvents.failed24h >= threshold;
    }

    if (alert.alertKey === "contest.low_fill_rate" && alert.enabled && dashboardStats) {
      const threshold = Number(alert.thresholdConfig.thresholdPercent ?? 40);
      triggered =
        dashboardStats.activeContests > 0 &&
        dashboardStats.contestFillRatePercent < threshold;
    }

    return { ...alert, triggered };
  });
}
