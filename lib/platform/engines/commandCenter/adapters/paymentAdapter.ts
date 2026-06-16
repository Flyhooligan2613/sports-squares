import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { PaymentCenterSummary, PaymentCenterTransaction } from "../types";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchPaymentCenterSummary(limit = 25): Promise<PaymentCenterSummary> {
  const empty: PaymentCenterSummary = {
    depositsTodayCents: 0,
    withdrawalsTodayCents: 0,
    pendingCount: 0,
    failedCount: 0,
    completedTodayCount: 0,
    recentTransactions: [],
  };

  if (!isSupabaseAdminConfigured()) return empty;

  const supabase = getSupabaseAdmin();
  const today = startOfTodayIso();

  const [recentRes, depositsRes, withdrawalsRes, pendingRes, failedRes, completedTodayRes] =
    await Promise.all([
      supabase
        .from("payment_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit),
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
        .eq("status", "pending"),
      supabase
        .from("payment_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
      supabase
        .from("payment_transactions")
        .select("id", { count: "exact", head: true })
        .in("status", ["completed", "captured"])
        .gte("created_at", today),
    ]);

  const recentTransactions: PaymentCenterTransaction[] = (recentRes.data ?? []).map((row) => ({
    id: row.id as string,
    playerEmail: row.player_email as string,
    transactionType: row.transaction_type as string,
    amountCents: row.amount_cents as number,
    status: row.status as string,
    provider: row.provider as string,
    poolId: (row.pool_id as string | null) ?? null,
    contestId: (row.contest_id as string | null) ?? null,
    createdAt: row.created_at as string,
  }));

  return {
    depositsTodayCents: (depositsRes.data ?? []).reduce(
      (sum, r) => sum + (r.amount_cents as number),
      0
    ),
    withdrawalsTodayCents: (withdrawalsRes.data ?? []).reduce(
      (sum, r) => sum + (r.amount_cents as number),
      0
    ),
    pendingCount: pendingRes.count ?? 0,
    failedCount: failedRes.count ?? 0,
    completedTodayCount: completedTodayRes.count ?? 0,
    recentTransactions,
  };
}
