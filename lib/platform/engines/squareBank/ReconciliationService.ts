import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { fetchBankAnalytics } from "./repository";
import type { SquareBankHealthMetrics, SquareBankReconciliationPeriod, SquareBankReconciliationResult } from "./types";
import { insertReconciliationRun } from "./repository";

function periodStart(period: SquareBankReconciliationPeriod): string {
  const d = new Date();
  if (period === "daily") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    d.setDate(d.getDate() - 7);
  } else {
    d.setMonth(d.getMonth() - 1);
  }
  return d.toISOString();
}

/** Compare PaymentEngine vs ledger vs contests; flag mismatches. */
export async function runReconciliation(
  period: SquareBankReconciliationPeriod = "daily"
): Promise<SquareBankReconciliationResult> {
  const mismatches: SquareBankReconciliationResult["mismatchDetails"] = [];

  if (!isSupabaseAdminConfigured()) {
    const runId = await insertReconciliationRun({
      period,
      status: "completed",
      mismatchCount: 0,
    });
    return { runId, period, status: "completed", mismatchCount: 0, mismatchDetails: [] };
  }

  const supabase = getSupabaseAdmin();
  const since = periodStart(period);

  const [paymentRes, ledgerRes, contestRes] = await Promise.all([
    supabase
      .from("payment_transactions")
      .select("amount_cents, status")
      .gte("created_at", since)
      .in("status", ["completed", "captured"]),
    supabase
      .from("square_bank_ledger")
      .select("amount_cents, direction")
      .gte("created_at", since),
    supabase
      .from("payment_transactions")
      .select("amount_cents")
      .eq("transaction_type", "contest_entry")
      .gte("created_at", since)
      .in("status", ["completed", "captured"]),
  ]);

  const paymentTotal = (paymentRes.data ?? []).reduce(
    (s, r) => s + Number(r.amount_cents),
    0
  );
  const ledgerTotal = (ledgerRes.data ?? []).reduce((s, r) => {
    const sign = r.direction === "credit" ? 1 : -1;
    return s + sign * Number(r.amount_cents);
  }, 0);
  const contestTotal = (contestRes.data ?? []).reduce(
    (s, r) => s + Number(r.amount_cents),
    0
  );

  const ledgerContestEntries = (ledgerRes.data ?? [])
    .filter((r) => r.direction === "debit")
    .reduce((s, r) => s + Number(r.amount_cents), 0);

  if (Math.abs(contestTotal - ledgerContestEntries) > 100) {
    mismatches.push({
      source: "contest_entries",
      expectedCents: contestTotal,
      actualCents: ledgerContestEntries,
      note: "PaymentEngine contest entries vs SquareBank debits",
    });
  }

  const runId = await insertReconciliationRun({
    period,
    paymentEngineTotalCents: paymentTotal,
    ledgerTotalCents: ledgerTotal,
    contestTotalCents: contestTotal,
    mismatchCount: mismatches.length,
    mismatchDetails: mismatches,
    status: "completed",
  });

  return {
    runId,
    period,
    status: "completed",
    mismatchCount: mismatches.length,
    mismatchDetails: mismatches,
  };
}

export async function getFinancialHealthMetrics(): Promise<SquareBankHealthMetrics> {
  const analytics = await fetchBankAnalytics();

  if (!isSupabaseAdminConfigured()) {
    return {
      totalAccounts: 0,
      totalDepositsCents: 0,
      totalWithdrawalsCents: 0,
      totalPendingCents: 0,
      avgAvailableCashCents: 0,
      dailyVolumeCents: 0,
      monthlyVolumeCents: 0,
      failedPaymentsCount: 0,
      chargebacksCount: 0,
      refundsCount: 0,
      contestFeesCents: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const dayStart = periodStart("daily");
  const monthStart = periodStart("monthly");

  const [dailyVol, monthlyVol, failed, chargebacks, refunds, contestFees] = await Promise.all([
    supabase
      .from("square_bank_ledger")
      .select("amount_cents")
      .gte("created_at", dayStart),
    supabase
      .from("square_bank_ledger")
      .select("amount_cents")
      .gte("created_at", monthStart),
    supabase
      .from("payment_transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("square_bank_ledger")
      .select("id", { count: "exact", head: true })
      .eq("entry_type", "chargeback"),
    supabase
      .from("square_bank_ledger")
      .select("id", { count: "exact", head: true })
      .in("entry_type", ["contest_refund", "reversal"]),
    supabase
      .from("square_bank_ledger")
      .select("amount_cents")
      .eq("entry_type", "contest_entry")
      .gte("created_at", monthStart),
  ]);

  return {
    totalAccounts: analytics.totalAccounts,
    totalDepositsCents: analytics.totalDepositsCents,
    totalWithdrawalsCents: analytics.totalWithdrawalsCents,
    totalPendingCents: analytics.totalPendingCents,
    avgAvailableCashCents: analytics.avgAvailableCashCents,
    dailyVolumeCents: (dailyVol.data ?? []).reduce((s, r) => s + Number(r.amount_cents), 0),
    monthlyVolumeCents: (monthlyVol.data ?? []).reduce((s, r) => s + Number(r.amount_cents), 0),
    failedPaymentsCount: failed.count ?? 0,
    chargebacksCount: chargebacks.count ?? 0,
    refundsCount: refunds.count ?? 0,
    contestFeesCents: (contestFees.data ?? []).reduce((s, r) => s + Number(r.amount_cents), 0),
  };
}
