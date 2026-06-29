import {
  MOCK_GEO_STATES,
  MOCK_GEO_STATES_MAP,
  getGeoSummary,
} from "../geo-compliance/mockStates";
import type { GeoState } from "../geo-compliance/types";
import type { GeoOperationsState } from "./types";

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function enrichState(state: GeoState): GeoOperationsState {
  const h = hashCode(state.id);
  const live = state.status === "live";
  const review = state.status === "under_review";

  return {
    ...state,
    lastReviewed: state.lastUpdated,
    platformAvailability: live
      ? "Full platform access"
      : review
        ? "Limited — waitlist & community only"
        : "Unavailable — waitlist enrollment only",
    paidContests: live,
    freePlay: live || review,
    walletEnabled: live,
    depositsEnabled: live,
    withdrawalsEnabled: live,
    referralProgram: live || review,
    todayRevenue: live ? Math.floor(state.revenue / 365 + (h % 5000)) : 0,
    todayDeposits: live ? Math.floor(state.distribution.deposits / 365 + (h % 3000)) : 0,
    todayWithdrawals: live ? Math.floor(state.distribution.deposits / 480 + (h % 2000)) : 0,
    retention: live ? 62 + (h % 18) : review ? 0 : 0,
    riskScore: live ? 12 + (h % 35) : review ? 45 + (h % 30) : 70 + (h % 25),
    administratorNotes: live
      ? `${state.administrator}: No pending admin actions. Standard monitoring cadence.`
      : review
        ? `${state.administrator}: Awaiting legal sign-off before status change. Do not auto-enable.`
        : `${state.administrator}: Jurisdiction disabled. Monitor waitlist for expansion signals.`,
  };
}

export const MOCK_GEO_OPS_STATES: GeoOperationsState[] =
  MOCK_GEO_STATES.map(enrichState);

export const MOCK_GEO_OPS_STATES_MAP = Object.fromEntries(
  MOCK_GEO_OPS_STATES.map((s) => [s.id, s]),
) as Record<string, GeoOperationsState>;

export { getGeoSummary };
