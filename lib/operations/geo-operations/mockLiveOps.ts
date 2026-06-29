import type { LiveOpsMetrics } from "./types";
import { MOCK_COMPLIANCE_ALERTS } from "../geo-compliance/mockAlerts";
import { MOCK_GEO_OPS_STATES } from "./mockStates";

const openAlerts = MOCK_COMPLIANCE_ALERTS.filter(
  (a) => a.status === "open" || a.status === "pending_legal",
).length;

export const MOCK_LIVE_OPS: LiveOpsMetrics = {
  playersOnline: MOCK_GEO_OPS_STATES.reduce(
    (sum, s) => sum + Math.floor(s.activePlayers * 0.08),
    0,
  ),
  liveBoards: MOCK_GEO_OPS_STATES.reduce((sum, s) => sum + s.openBoards, 0),
  depositsToday: MOCK_GEO_OPS_STATES.reduce((sum, s) => sum + s.todayDeposits, 0),
  withdrawalsToday: MOCK_GEO_OPS_STATES.reduce(
    (sum, s) => sum + s.todayWithdrawals,
    0,
  ),
  verificationQueue: 47,
  supportQueue: MOCK_GEO_OPS_STATES.reduce((sum, s) => sum + s.supportTickets, 0),
  complianceAlerts: openAlerts,
  riskAlerts: 6,
};
