import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { countPendingWithdrawalHolds } from "@/lib/platform/engines/payment/wallet/WithdrawalHoldService";
import { fetchSystemHealth } from "../services/HealthService";
import { COMPETITOR_ONLINE_WINDOW_MINUTES } from "../config";
import type { CommandCenterDashboardStats, SystemHealthStatus } from "../types";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function onlineSinceIso(): string {
  return new Date(Date.now() - COMPETITOR_ONLINE_WINDOW_MINUTES * 60_000).toISOString();
}

function deriveHealthStatus(
  health: Awaited<ReturnType<typeof fetchSystemHealth>>
): SystemHealthStatus {
  if (!health.supabaseConfigured || !health.supabaseReachable) return "critical";
  if (health.alerts.some((a) => a.severity === "critical")) return "critical";
  if (
    health.alerts.length > 0 ||
    !health.paymentEngineConfigured ||
    health.webhookFailures24h > 0
  ) {
    return "degraded";
  }
  return "healthy";
}

const EMPTY_OPS: Pick<
  CommandCenterDashboardStats,
  | "openSupportTickets"
  | "pendingWithdrawals"
  | "pendingWithdrawalHolds"
  | "pendingVerifications"
  | "contestEntriesToday"
  | "platformAlertsTriggered"
  | "systemHealthStatus"
> = {
  openSupportTickets: 0,
  pendingWithdrawals: 0,
  pendingWithdrawalHolds: 0,
  pendingVerifications: 0,
  contestEntriesToday: 0,
  platformAlertsTriggered: 0,
  systemHealthStatus: "critical",
};

/** Attach alert count after base stats to avoid circular fetch with AlertService. */
export function enrichDashboardStats(
  stats: CommandCenterDashboardStats,
  triggeredAlertCount: number
): CommandCenterDashboardStats {
  return { ...stats, platformAlertsTriggered: triggeredAlertCount };
}

export async function fetchDashboardStats(): Promise<CommandCenterDashboardStats> {
  const dataGaps: string[] = [];
  const today = startOfTodayIso();
  const onlineSince = onlineSinceIso();

  if (!isSupabaseAdminConfigured()) {
    return {
      competitorsOnline: 0,
      activeContests: 0,
      prizePoolCents: 0,
      depositsTodayCents: 0,
      withdrawalsTodayCents: 0,
      rewardDropsToday: 0,
      highlightSquaresActive: 0,
      championsToday: 0,
      newRegistrationsToday: 0,
      contestFillRatePercent: 0,
      ...EMPTY_OPS,
      dataGaps: ["Supabase admin not configured — all stats unavailable."],
    };
  }

  const supabase = getSupabaseAdmin();

  const [
    onlineRes,
    activePoolsRes,
    openPickemRes,
    activePickemRes,
    poolsForPrizeRes,
    depositsRes,
    withdrawalsRes,
    rewardCreditsRes,
    highlightsRes,
    championsRes,
    registrationsRes,
    poolsFillRes,
    openSupportRes,
    pendingWithdrawalsRes,
    pendingHoldsRes,
    pendingKycRes,
    contestEntriesRes,
    health,
  ] = await Promise.all([
    supabase
      .from("player_auth_profiles")
      .select("email", { count: "exact", head: true })
      .gte("last_active_at", onlineSince),
    supabase
      .from("pools")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "locked", "numbers-drawn"]),
    supabase
      .from("pickem_contests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("pickem_contests")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("pools")
      .select("id, cost_per_square, entry_tier_cents")
      .in("status", ["open", "locked", "numbers-drawn"]),
    supabase
      .from("payment_transactions")
      .select("amount_cents")
      .eq("transaction_type", "deposit")
      .in("status", ["completed", "captured"])
      .gte("created_at", today),
    supabase
      .from("payment_transactions")
      .select("amount_cents")
      .eq("transaction_type", "withdrawal")
      .in("status", ["completed", "captured"])
      .gte("created_at", today),
    supabase
      .from("payment_transactions")
      .select("id", { count: "exact", head: true })
      .eq("transaction_type", "reward_credit")
      .gte("created_at", today),
    supabase
      .from("pool_highlight_squares")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("podium_finishes")
      .select("id", { count: "exact", head: true })
      .eq("placement", 1)
      .gte("created_at", today),
    supabase
      .from("player_profiles")
      .select("email", { count: "exact", head: true })
      .gte("created_at", today),
    supabase
      .from("pools")
      .select("id, status")
      .in("status", ["open", "locked"]),
    supabase
      .from("support_threads")
      .select("id", { count: "exact", head: true })
      .neq("status", "resolved")
      .neq("status", "closed"),
    supabase
      .from("payment_transactions")
      .select("id", { count: "exact", head: true })
      .eq("transaction_type", "withdrawal")
      .eq("status", "pending"),
    countPendingWithdrawalHolds().catch(() => 0),
    supabase
      .from("square_bank_accounts")
      .select("id", { count: "exact", head: true })
      .eq("kyc_status", "pending"),
    supabase
      .from("payment_transactions")
      .select("id", { count: "exact", head: true })
      .eq("transaction_type", "contest_entry")
      .gte("created_at", today),
    fetchSystemHealth().catch(() => null),
  ]);

  if (onlineRes.error) dataGaps.push("competitorsOnline: player_auth_profiles unavailable");
  if (depositsRes.error) dataGaps.push("depositsToday: payment_transactions table may need migration 052");
  if (highlightsRes.error) dataGaps.push("highlightSquares: pool_highlight_squares unavailable");
  if (championsRes.error) dataGaps.push("championsToday: podium_finishes may need migration 051");
  if (registrationsRes.error) dataGaps.push("newRegistrations: player_profiles unavailable");
  if (openSupportRes.error) dataGaps.push("openSupportTickets: support_threads unavailable");
  if (pendingKycRes.error) dataGaps.push("pendingVerifications: square_bank_accounts unavailable");

  const activeContests =
    (activePoolsRes.count ?? 0) + (openPickemRes.count ?? 0) + (activePickemRes.count ?? 0);

  const prizePoolCents = await estimatePrizePoolCents(supabase, poolsForPrizeRes.data ?? []);

  const depositsTodayCents = (depositsRes.data ?? []).reduce(
    (sum, row) => sum + (row.amount_cents as number),
    0
  );
  const withdrawalsTodayCents = (withdrawalsRes.data ?? []).reduce(
    (sum, row) => sum + (row.amount_cents as number),
    0
  );

  const contestFillRatePercent = await computeAverageFillRate(
    supabase,
    poolsFillRes.data ?? []
  );

  const systemHealthStatus = health ? deriveHealthStatus(health) : "degraded";

  return {
    competitorsOnline: onlineRes.count ?? 0,
    activeContests,
    prizePoolCents,
    depositsTodayCents,
    withdrawalsTodayCents,
    rewardDropsToday: rewardCreditsRes.count ?? 0,
    highlightSquaresActive: highlightsRes.count ?? 0,
    championsToday: championsRes.count ?? 0,
    newRegistrationsToday: registrationsRes.count ?? 0,
    contestFillRatePercent,
    openSupportTickets: openSupportRes.count ?? 0,
    pendingWithdrawals: pendingWithdrawalsRes.count ?? 0,
    pendingWithdrawalHolds: pendingHoldsRes,
    pendingVerifications: pendingKycRes.count ?? 0,
    contestEntriesToday: contestEntriesRes.count ?? 0,
    platformAlertsTriggered: 0,
    systemHealthStatus,
    dataGaps,
  };
}

function countClaimedSquaresByPool(
  rows: Array<{ pool_id: string }> | null
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    counts.set(row.pool_id, (counts.get(row.pool_id) ?? 0) + 1);
  }
  return counts;
}

async function fetchClaimedSquareCountsByPool(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  poolIds: string[]
): Promise<Map<string, number>> {
  if (poolIds.length === 0) return new Map();

  const { data } = await supabase
    .from("squares")
    .select("pool_id")
    .in("pool_id", poolIds)
    .eq("claimed", true);

  return countClaimedSquaresByPool(data as Array<{ pool_id: string }> | null);
}

async function estimatePrizePoolCents(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  pools: Array<{ id: string; cost_per_square: number; entry_tier_cents: number | null }>
): Promise<number> {
  if (pools.length === 0) return 0;

  const claimedByPool = await fetchClaimedSquareCountsByPool(
    supabase,
    pools.map((pool) => pool.id)
  );

  let total = 0;
  for (const pool of pools) {
    const costCents =
      pool.entry_tier_cents ?? Math.round((pool.cost_per_square ?? 0) * 100);
    total += costCents * (claimedByPool.get(pool.id) ?? 0);
  }
  return total;
}

async function computeAverageFillRate(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  pools: Array<{ id: string; status: string }>
): Promise<number> {
  if (pools.length === 0) return 0;

  const claimedByPool = await fetchClaimedSquareCountsByPool(
    supabase,
    pools.map((pool) => pool.id)
  );

  const rates = pools.map((pool) => {
    const claimed = claimedByPool.get(pool.id) ?? 0;
    return Math.min(100, Math.round((claimed / 100) * 100));
  });

  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
}
