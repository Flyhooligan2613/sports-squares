export type {
  GeoStateStatus,
  ComplianceAlertSeverity,
  ComplianceAlertStatus,
  OpsHealthStatus,
  GeoWaitlist,
  GeoDistributionMetrics,
  ComplianceAlert,
  ComplianceAuditEntry,
  OpsHealthItem,
  GeoSearchResult,
  StateMapPath,
} from "../geo-compliance/types";

import type { GeoState } from "../geo-compliance/types";

/** Extended state record for Geo Operations Center™ */
export interface GeoOperationsState extends GeoState {
  lastReviewed: string;
  platformAvailability: string;
  paidContests: boolean;
  freePlay: boolean;
  walletEnabled: boolean;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  referralProgram: boolean;
  todayRevenue: number;
  todayDeposits: number;
  todayWithdrawals: number;
  retention: number;
  riskScore: number;
  administratorNotes: string;
}

export interface ExpansionScore {
  stateId: string;
  stateName: string;
  score: number;
  waitlistGrowth: number;
  referralInterest: number;
  traffic: number;
  signups: number;
  engagement: number;
  supportDemand: number;
  revenuePotential: number;
  trend: "up" | "stable" | "down";
}

export interface LiveOpsMetrics {
  playersOnline: number;
  liveBoards: number;
  depositsToday: number;
  withdrawalsToday: number;
  verificationQueue: number;
  supportQueue: number;
  complianceAlerts: number;
  riskAlerts: number;
}

export interface LocationCheckDemo {
  id: string;
  label: string;
  location: string;
  result: "permitted" | "restricted" | "waitlist";
  message: string;
}

export type HeatmapMetricKey =
  | "playerDensity"
  | "revenueDensity"
  | "contestActivity"
  | "waitlistGrowth"
  | "referralActivity"
  | "growthTrend";

export interface GeoSearchFilter {
  types: Array<"state" | "city" | "zip" | "player" | "contest" | "alert" | "revenue">;
}
