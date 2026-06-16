"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import type { FinancialHealthSummary } from "@/lib/platform/engines/commandCenter";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function FinancialHealthPage() {
  const [summary, setSummary] = useState<FinancialHealthSummary | null>(null);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    fetch("/api/admin/command-center/finance")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { summary: FinancialHealthSummary };
          setSummary(data.summary);
        }
      })
      .catch(() => setSummary(null));
  }, []);

  async function runReconciliation() {
    setReconciling(true);
    try {
      await fetch("/api/square-bank/reconcile?period=daily");
      const res = await fetch("/api/admin/command-center/finance");
      if (res.ok) {
        const data = (await res.json()) as { summary: FinancialHealthSummary };
        setSummary(data.summary);
      }
    } finally {
      setReconciling(false);
    }
  }

  if (!summary) return <SkeletonKpiGrid count={4} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Financial Health</h2>
          <p className="text-sm text-sb-muted mt-1">
            SquareBank™ ledger truth — PaymentEngine provider refs vs immutable ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={runReconciliation}
          disabled={reconciling}
          className="px-4 py-2 rounded-lg bg-sb-glow/20 text-sb-glow text-sm font-medium hover:bg-sb-glow/30 disabled:opacity-50"
        >
          {reconciling ? "Reconciling…" : "Run Daily Reconciliation"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Total Accounts" value={summary.totalAccounts} accent="purple" />
        <AdminStatCard label="Total Deposits" value={formatCents(summary.totalDepositsCents)} accent="success" />
        <AdminStatCard label="Total Withdrawals" value={formatCents(summary.totalWithdrawalsCents)} accent="muted" />
        <AdminStatCard label="Pending Funds" value={formatCents(summary.totalPendingCents)} accent="gold" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Avg Available Cash" value={formatCents(summary.avgAvailableCashCents)} accent="success" />
        <AdminStatCard label="Daily Volume" value={formatCents(summary.dailyVolumeCents)} accent="purple" />
        <AdminStatCard label="Monthly Volume" value={formatCents(summary.monthlyVolumeCents)} accent="purple" />
        <AdminStatCard label="Contest Fees (MTD)" value={formatCents(summary.contestFeesCents)} accent="gold" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Failed Payments" value={summary.failedPaymentsCount} accent="purple" />
        <AdminStatCard label="Chargebacks" value={summary.chargebacksCount} accent="muted" />
        <AdminStatCard label="Refunds" value={summary.refundsCount} accent="muted" />
        <AdminStatCard
          label="Reconciliation Mismatches"
          value={summary.reconciliationMismatchCount}
          accent={summary.reconciliationMismatchCount > 0 ? "purple" : "success"}
        />
      </div>

      <LandingGlassCard className="p-4 sm:p-5 flex flex-wrap gap-4">
        <Link href="/admin/command-center/payments" className="text-sm text-sb-glow hover:text-white">
          Payment Center →
        </Link>
        <Link href="/admin/square-bank/disputes" className="text-sm text-sb-glow hover:text-white">
          Dispute Center →
        </Link>
      </LandingGlassCard>
    </div>
  );
}
