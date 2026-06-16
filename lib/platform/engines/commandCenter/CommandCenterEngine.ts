import { fetchContestOperationsSummary } from "./adapters/contestAdapter";
import { fetchPaymentCenterSummary } from "./adapters/paymentAdapter";
import { fetchDashboardStats } from "./adapters/statsAdapter";
import { fetchActivityFeed } from "./services/ActivityFeedService";
import {
  listCommandCenterAlerts,
  updateCommandCenterAlert,
} from "./services/AlertService";
import { fetchAuditLog } from "./services/AuditLogService";
import { fetchSystemHealth } from "./services/HealthService";
import { searchCommandCenter } from "./services/SearchService";
import { getGrowthFundStats } from "@/lib/platform/core/growthFund";
import type { ExecutiveDashboardSummary } from "./types";

/** CommandCenterEngine™ — orchestrates read-only adapters across platform engines. */
export const CommandCenterEngine = {
  getDashboardStats: fetchDashboardStats,
  getActivityFeed: fetchActivityFeed,
  getPaymentCenterSummary: fetchPaymentCenterSummary,
  getContestOperationsSummary: fetchContestOperationsSummary,
  getAuditLog: fetchAuditLog,
  search: searchCommandCenter,
  listAlerts: listCommandCenterAlerts,
  updateAlert: updateCommandCenterAlert,
  getSystemHealth: fetchSystemHealth,

  async getExecutiveSummary(): Promise<ExecutiveDashboardSummary> {
    const [stats, payments, alerts, growthFund] = await Promise.all([
      fetchDashboardStats(),
      fetchPaymentCenterSummary(10),
      listCommandCenterAlerts(),
      getGrowthFundStats().catch(() => ({
        balanceCents: 0,
        lifetimeContributionsCents: 0,
        monthlyContributionsCents: 0,
      })),
    ]);

    return {
      stats,
      financialOverview: {
        depositsTodayCents: payments.depositsTodayCents,
        withdrawalsTodayCents: payments.withdrawalsTodayCents,
        prizePoolCents: stats.prizePoolCents,
        growthFundBalanceCents: growthFund.balanceCents,
      },
      topAlerts: alerts.filter((a) => a.triggered).slice(0, 5),
    };
  },
};

export type CommandCenterEngineType = typeof CommandCenterEngine;
