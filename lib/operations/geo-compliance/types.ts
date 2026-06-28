export type GeoStateStatus = "live" | "under_review" | "disabled";

export type ComplianceAlertSeverity = "info" | "warning" | "critical";

export type ComplianceAlertStatus =
  | "open"
  | "pending_legal"
  | "resolved"
  | "dismissed";

export type OpsHealthStatus = "healthy" | "degraded" | "down";

export interface GeoState {
  id: string;
  name: string;
  status: GeoStateStatus;
  disabledReason?: string;
  population: number;
  registeredPlayers: number;
  activePlayers: number;
  revenue: number;
  walletVolume: number;
  openBoards: number;
  completedBoards: number;
  chargebackRate: number;
  verificationRate: number;
  referralCount: number;
  supportTickets: number;
  complianceAlerts: number;
  contestTypesEnabled: string[];
  sportsEnabled: string[];
  maxPrizePool: number;
  depositLimit: number;
  withdrawalLimit: number;
  ageRequirement: number;
  kycRequirement: string;
  paymentMethods: string[];
  notes: string;
  administrator: string;
  lastUpdated: string;
  waitlist?: GeoWaitlist;
  distribution: GeoDistributionMetrics;
}

export interface GeoWaitlist {
  currentWaitlist: number;
  projectedLaunch: string;
  notificationCount: number;
  interestScore: number;
  allowedFeatures: string[];
}

export interface GeoDistributionMetrics {
  playersRank: number;
  revenueRank: number;
  deposits: number;
  avgContestSize: number;
  referralActivity: number;
  growthTrend: number;
}

export interface ComplianceAlert {
  id: string;
  stateId: string;
  stateName: string;
  title: string;
  description: string;
  severity: ComplianceAlertSeverity;
  date: string;
  source: string;
  status: ComplianceAlertStatus;
  recommendedAction: string;
}

export interface ComplianceAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  stateId: string;
  details: string;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "expansion" | "inventory" | "compliance" | "retention";
  stateIds: string[];
  metric?: string;
}

export interface OpsHealthItem {
  id: string;
  label: string;
  status: OpsHealthStatus;
  message: string;
}

export interface FounderGeoInsight {
  id: string;
  label: string;
  states: string[];
  value: string;
  trend?: string;
  accent: "success" | "warning" | "danger" | "blue" | "purple";
}

export interface GeoSearchResult {
  id: string;
  type: "state" | "player" | "alert" | "revenue" | "contest";
  label: string;
  sublabel: string;
  stateId?: string;
}

export interface StateMapPath {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}
