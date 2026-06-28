import type { OpsHealthItem } from "./types";

export const MOCK_OPS_HEALTH: OpsHealthItem[] = [
  { id: "api", label: "API", status: "healthy", message: "All endpoints responding < 120ms p99" },
  { id: "payments", label: "Payments", status: "healthy", message: "Stripe Connect operational" },
  { id: "wallet", label: "Wallet", status: "healthy", message: "Ledger sync nominal" },
  { id: "auth", label: "Authentication", status: "healthy", message: "Session & MFA stable" },
  { id: "live-games", label: "Live Games", status: "degraded", message: "2 boards in recovery mode" },
  { id: "notifications", label: "Notifications", status: "healthy", message: "98.7% delivery rate" },
  { id: "compliance", label: "Compliance", status: "degraded", message: "3 jurisdictions under review" },
  { id: "analytics", label: "Analytics", status: "healthy", message: "Pipeline lag < 2 min" },
];
