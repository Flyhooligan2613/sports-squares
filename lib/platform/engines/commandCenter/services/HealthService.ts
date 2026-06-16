import { getDbReadPhase } from "@/lib/database/config";
import {
  getPaymentProviderId,
  isPaymentEngineConfigured,
} from "@/lib/platform/engines/payment/config";
import { getFinancialStatusOverview } from "@/lib/platform/core/financialStatus";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AlertSeverity, SystemHealthReport } from "../types";

export async function fetchSystemHealth(): Promise<SystemHealthReport> {
  const configured = isSupabaseAdminConfigured();
  const alerts: Array<{ key: string; message: string; severity: AlertSeverity }> = [];

  if (!configured) {
    alerts.push({
      key: "supabase",
      message: "Supabase service role not configured.",
      severity: "critical",
    });
  }

  if (!isPaymentEngineConfigured()) {
    alerts.push({
      key: "payment",
      message: "PaymentEngine is not fully configured.",
      severity: "warning",
    });
  }

  let supabaseReachable = false;
  let tableCounts: SystemHealthReport["tableCounts"] = null;
  let webhookEvents24h = 0;
  let webhookFailures24h = 0;

  if (configured) {
    try {
      const supabase = getSupabaseAdmin();
      const ping = await supabase.from("pools").select("id", { count: "exact", head: true });
      supabaseReachable = !ping.error;

      if (ping.error) {
        alerts.push({
          key: "db_ping",
          message: `Database ping failed: ${ping.error.message}`,
          severity: "critical",
        });
      }

      const [poolsRes, playersRes, paymentsRes, auditRes, financial] = await Promise.all([
        supabase.from("pools").select("id", { count: "exact", head: true }),
        supabase.from("players").select("id", { count: "exact", head: true }),
        supabase.from("payment_transactions").select("id", { count: "exact", head: true }),
        supabase.from("platform_audit_log").select("id", { count: "exact", head: true }),
        getFinancialStatusOverview().catch(() => null),
      ]);

      tableCounts = {
        pools: poolsRes.count ?? 0,
        players: playersRes.count ?? 0,
        paymentTransactions: paymentsRes.count ?? 0,
        auditEvents: auditRes.count ?? 0,
      };

      if (financial) {
        webhookEvents24h = financial.webhookEvents.total24h;
        webhookFailures24h = financial.webhookEvents.failed24h;
        if (financial.webhookEvents.failed24h > 0) {
          alerts.push({
            key: "webhooks",
            message: `${financial.webhookEvents.failed24h} webhook failures in 24h.`,
            severity: "warning",
          });
        }
      }
    } catch (err) {
      alerts.push({
        key: "db_error",
        message: err instanceof Error ? err.message : "Database health check failed.",
        severity: "critical",
      });
    }
  }

  return {
    supabaseConfigured: configured,
    supabaseReachable,
    paymentEngineConfigured: isPaymentEngineConfigured(),
    paymentProvider: getPaymentProviderId(),
    databasePhase: getDbReadPhase(),
    tableCounts,
    webhookEvents24h,
    webhookFailures24h,
    alerts,
  };
}
