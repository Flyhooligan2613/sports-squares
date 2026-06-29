/** Command Center™ role identifiers — internal ops only. */
export type CommandCenterRole =
  | "support"
  | "finance"
  | "compliance"
  | "marketing"
  | "operations"
  | "executive"
  | "engineering";

export type CommandCenterSectionId =
  | "dashboard"
  | "players"
  | "contests"
  | "payments"
  | "finance"
  | "compliance"
  | "geo-operations"
  | "community"
  | "support"
  | "announcements"
  | "analytics"
  | "security"
  | "health"
  | "alerts"
  | "executive"
  | "search"
  | "audit";

export type SystemHealthStatus = "healthy" | "degraded" | "critical";

export type ActivityCategory =
  | "contest"
  | "payment"
  | "reward"
  | "community"
  | "support"
  | "fraud"
  | "system";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertCategory =
  | "system"
  | "payment"
  | "contest"
  | "compliance"
  | "community"
  | "support"
  | "fraud";

export interface CommandCenterDashboardStats {
  competitorsOnline: number;
  activeContests: number;
  prizePoolCents: number;
  depositsTodayCents: number;
  withdrawalsTodayCents: number;
  rewardDropsToday: number;
  highlightSquaresActive: number;
  championsToday: number;
  newRegistrationsToday: number;
  contestFillRatePercent: number;
  /** Phase 3G — executive ops KPIs */
  openSupportTickets: number;
  pendingWithdrawals: number;
  pendingWithdrawalHolds: number;
  pendingVerifications: number;
  contestEntriesToday: number;
  platformAlertsTriggered: number;
  systemHealthStatus: SystemHealthStatus;
  /** Fields sourced from placeholders until telemetry exists. */
  dataGaps: string[];
}

export interface ActivityFeedItem {
  id: string;
  category: ActivityCategory;
  title: string;
  summary: string;
  severity: AlertSeverity;
  source: string;
  entityType?: string | null;
  entityId?: string | null;
  actorEmail?: string | null;
  createdAt: string;
}

export interface CommandCenterAlert {
  id: string;
  alertKey: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  enabled: boolean;
  thresholdConfig: Record<string, unknown>;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Runtime evaluation — not persisted. */
  triggered?: boolean;
}

export interface CommandCenterAuditEntry {
  id: string;
  eventType: string;
  summary: string;
  gameType: string | null;
  entityType: string | null;
  entityId: string | null;
  actorEmail: string | null;
  actorRole: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CommandCenterSearchResult {
  type: "pool" | "player" | "payment" | "audit" | "support";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface PaymentCenterSummary {
  depositsTodayCents: number;
  withdrawalsTodayCents: number;
  pendingCount: number;
  failedCount: number;
  completedTodayCount: number;
  recentTransactions: PaymentCenterTransaction[];
  walletTotalWallets: number;
  walletAvgAvailableCents: number;
  walletLifetimeDepositsCents: number;
  walletLifetimeWithdrawalsCents: number;
  walletUtilizationPercent: number;
  pendingWithdrawalHolds: number;
}

export interface FinancialHealthSummary {
  totalAccounts: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
  totalPendingCents: number;
  avgAvailableCashCents: number;
  dailyVolumeCents: number;
  monthlyVolumeCents: number;
  failedPaymentsCount: number;
  chargebacksCount: number;
  refundsCount: number;
  contestFeesCents: number;
  reconciliationMismatchCount: number;
}

export interface PaymentCenterTransaction {
  id: string;
  playerEmail: string;
  transactionType: string;
  amountCents: number;
  status: string;
  provider: string;
  poolId: string | null;
  contestId: string | null;
  createdAt: string;
}

export interface ContestOperationsSummary {
  activePools: number;
  openPools: number;
  lockedPools: number;
  pickemContestsOpen: number;
  pickemContestsActive: number;
  averageFillRatePercent: number;
  recentPools: Array<{
    id: string;
    name: string;
    status: string;
    homeTeam: string;
    awayTeam: string;
    playerCount: number;
    squareFillPercent: number;
  }>;
}

export interface SystemHealthReport {
  supabaseConfigured: boolean;
  supabaseReachable: boolean;
  paymentEngineConfigured: boolean;
  paymentProvider: string;
  databasePhase: number;
  tableCounts: {
    pools: number;
    players: number;
    paymentTransactions: number;
    auditEvents: number;
  } | null;
  webhookEvents24h: number;
  webhookFailures24h: number;
  alerts: Array<{ key: string; message: string; severity: AlertSeverity }>;
}

export interface ExecutiveDashboardSummary {
  stats: CommandCenterDashboardStats;
  financialOverview: {
    depositsTodayCents: number;
    withdrawalsTodayCents: number;
    prizePoolCents: number;
    growthFundBalanceCents: number;
  };
  topAlerts: CommandCenterAlert[];
}
