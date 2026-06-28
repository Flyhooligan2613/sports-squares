import type {
  ActivityFeedItem,
  CommandCenterAlert,
  CommandCenterAuditEntry,
  CommandCenterDashboardStats,
  ContestOperationsSummary,
  ExecutiveDashboardSummary,
  FinancialHealthSummary,
  PaymentCenterSummary,
  SystemHealthReport,
} from "./types";
import { getDemoDashboardStats } from "./mockStats";

export { getDemoDashboardStats };

const DEMO_NOW = new Date().toISOString();

export function getDemoPaymentSummary(): PaymentCenterSummary {
  return {
    depositsTodayCents: 124_500,
    withdrawalsTodayCents: 38_200,
    pendingCount: 2,
    failedCount: 1,
    completedTodayCount: 47,
    pendingWithdrawalHolds: 1,
    walletTotalWallets: 842,
    walletAvgAvailableCents: 12_450,
    walletLifetimeDepositsCents: 2_450_000,
    walletLifetimeWithdrawalsCents: 890_000,
    walletUtilizationPercent: 34,
    recentTransactions: [
      {
        id: "demo-tx-1",
        playerEmail: "competitor@demo.squareboards",
        transactionType: "deposit",
        amountCents: 5000,
        status: "completed",
        provider: "square",
        poolId: null,
        contestId: null,
        createdAt: DEMO_NOW,
      },
      {
        id: "demo-tx-2",
        playerEmail: "champion@demo.squareboards",
        transactionType: "withdrawal",
        amountCents: 12_000,
        status: "pending",
        provider: "square",
        poolId: null,
        contestId: null,
        createdAt: DEMO_NOW,
      },
    ],
  };
}

export function getDemoFinancialHealth(): FinancialHealthSummary {
  return {
    totalAccounts: 842,
    totalDepositsCents: 2_450_000,
    totalWithdrawalsCents: 890_000,
    totalPendingCents: 45_200,
    avgAvailableCashCents: 12_450,
    dailyVolumeCents: 162_700,
    monthlyVolumeCents: 1_840_000,
    failedPaymentsCount: 3,
    chargebacksCount: 0,
    refundsCount: 2,
    contestFeesCents: 18_400,
    reconciliationMismatchCount: 0,
  };
}

export function getDemoExecutiveSummary(): ExecutiveDashboardSummary {
  const stats = getDemoDashboardStats("Demo executive overview.");
  const payments = getDemoPaymentSummary();
  return {
    stats,
    financialOverview: {
      depositsTodayCents: payments.depositsTodayCents,
      withdrawalsTodayCents: payments.withdrawalsTodayCents,
      prizePoolCents: stats.prizePoolCents,
      growthFundBalanceCents: 125_000,
    },
    topAlerts: getDemoAlerts().filter((a) => a.triggered).slice(0, 3),
  };
}

export function getDemoAlerts(): CommandCenterAlert[] {
  return [
    {
      id: "demo-alert-1",
      alertKey: "payment.failed_spike",
      title: "Failed Payment Spike",
      message: "Failed payments exceeded threshold in the last hour.",
      severity: "critical",
      category: "payment",
      enabled: true,
      thresholdConfig: { threshold: 5 },
      lastTriggeredAt: null,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
      triggered: false,
    },
    {
      id: "demo-alert-2",
      alertKey: "contest.low_fill_rate",
      title: "Low Contest Fill Rate",
      message: "Active boards below target fill percentage.",
      severity: "warning",
      category: "contest",
      enabled: true,
      thresholdConfig: { thresholdPercent: 40 },
      lastTriggeredAt: DEMO_NOW,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
      triggered: true,
    },
    {
      id: "demo-alert-3",
      alertKey: "support.high_priority_backlog",
      title: "High-Priority Support Backlog",
      message: "Unresolved high-priority support threads exceed threshold.",
      severity: "warning",
      category: "support",
      enabled: true,
      thresholdConfig: { threshold: 10 },
      lastTriggeredAt: null,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
      triggered: false,
    },
    {
      id: "demo-alert-4",
      alertKey: "system.webhook_failures",
      title: "Webhook Failure Rate",
      message: "Payment webhook failures exceeded threshold in 24h.",
      severity: "info",
      category: "system",
      enabled: true,
      thresholdConfig: { threshold: 3 },
      lastTriggeredAt: null,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
      triggered: false,
    },
  ];
}

export function getDemoActivityFeed(): ActivityFeedItem[] {
  return [
    {
      id: "demo-act-1",
      category: "contest",
      title: "Board filled to 85%",
      summary: "Chiefs vs Eagles — No Wait Line spawned next board.",
      severity: "info",
      source: "contest_engine",
      createdAt: DEMO_NOW,
    },
    {
      id: "demo-act-2",
      category: "payment",
      title: "Deposit completed",
      summary: "$50.00 deposit — competitor@demo.squareboards",
      severity: "info",
      source: "payment_engine",
      createdAt: DEMO_NOW,
    },
    {
      id: "demo-act-3",
      category: "reward",
      title: "Highlight Square awarded",
      summary: "Quarter winner celebration triggered in Live Arena.",
      severity: "info",
      source: "reward_core",
      createdAt: DEMO_NOW,
    },
  ];
}

export function getDemoContestSummary(): ContestOperationsSummary {
  return {
    activePools: 14,
    openPools: 8,
    lockedPools: 6,
    pickemContestsOpen: 3,
    pickemContestsActive: 2,
    averageFillRatePercent: 72,
    recentPools: [
      {
        id: "demo-pool-1",
        name: "Super Bowl LX — Demo Board",
        status: "open",
        homeTeam: "Chiefs",
        awayTeam: "Eagles",
        playerCount: 68,
        squareFillPercent: 68,
      },
      {
        id: "demo-pool-2",
        name: "MLB Nightcap — Demo Board",
        status: "locked",
        homeTeam: "Yankees",
        awayTeam: "Red Sox",
        playerCount: 100,
        squareFillPercent: 100,
      },
    ],
  };
}

export function getDemoSystemHealth(): SystemHealthReport {
  return {
    supabaseConfigured: true,
    supabaseReachable: true,
    paymentEngineConfigured: true,
    paymentProvider: "square (demo)",
    databasePhase: 6,
    tableCounts: {
      pools: 42,
      players: 842,
      paymentTransactions: 12_400,
      auditEvents: 8_200,
    },
    webhookEvents24h: 156,
    webhookFailures24h: 0,
    alerts: [],
  };
}

export function getDemoAuditEntries(): CommandCenterAuditEntry[] {
  return [
    {
      id: "demo-audit-1",
      eventType: "contest.board_created",
      summary: "New squares board created — Super Bowl LX Demo",
      gameType: "nfl",
      entityType: "pool",
      entityId: "demo-pool-1",
      actorEmail: "ops@squareboards.com",
      actorRole: "admin",
      metadata: {},
      createdAt: DEMO_NOW,
    },
    {
      id: "demo-audit-2",
      eventType: "payment.deposit_completed",
      summary: "Deposit completed — $50.00",
      gameType: null,
      entityType: "payment",
      entityId: "demo-tx-1",
      actorEmail: "competitor@demo.squareboards",
      actorRole: "player",
      metadata: {},
      createdAt: DEMO_NOW,
    },
  ];
}

export interface DemoPlatformPlayer {
  email: string;
  displayName: string | null;
  slug: string | null;
  accountSuspended: boolean;
  securityFlagged: boolean;
  createdAt: string | null;
}

export function getDemoPlayers(): DemoPlatformPlayer[] {
  return [
    {
      email: "competitor@demo.squareboards",
      displayName: "Demo Competitor",
      slug: "demo-competitor",
      accountSuspended: false,
      securityFlagged: false,
      createdAt: DEMO_NOW,
    },
    {
      email: "champion@demo.squareboards",
      displayName: "Demo Champion",
      slug: "demo-champion",
      accountSuspended: false,
      securityFlagged: false,
      createdAt: DEMO_NOW,
    },
  ];
}

export type { CommandCenterDashboardStats };
