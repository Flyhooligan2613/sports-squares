import type { CommandCenterDashboardStats } from "./types";

/** Demo fallback when live stats are unavailable (investor/demo environments). */
export function getDemoDashboardStats(reason?: string): CommandCenterDashboardStats {
  return {
    competitorsOnline: 128,
    activeContests: 14,
    prizePoolCents: 485_000,
    depositsTodayCents: 124_500,
    withdrawalsTodayCents: 38_200,
    rewardDropsToday: 6,
    highlightSquaresActive: 3,
    championsToday: 2,
    newRegistrationsToday: 19,
    contestFillRatePercent: 72,
    openSupportTickets: 4,
    pendingWithdrawals: 2,
    pendingWithdrawalHolds: 1,
    pendingVerifications: 3,
    contestEntriesToday: 87,
    platformAlertsTriggered: 0,
    systemHealthStatus: "healthy",
    dataGaps: [reason ?? "Demo data — live stats unavailable."],
  };
}
