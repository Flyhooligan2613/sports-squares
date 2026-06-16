"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import type { PaymentCenterSummary } from "@/lib/platform/engines/commandCenter";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function PaymentCenterPage() {
  const [summary, setSummary] = useState<PaymentCenterSummary | null>(null);

  useEffect(() => {
    fetch("/api/admin/command-center/payments?limit=30")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { summary: PaymentCenterSummary };
          setSummary(data.summary);
        }
      })
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return <SkeletonKpiGrid count={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Payment Center</h2>
        <p className="text-sm text-sb-muted mt-1">
          Transaction Center data via PaymentEngine™ — no duplicated financial logic.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <AdminStatCard label="Deposits Today" value={formatCents(summary.depositsTodayCents)} accent="success" />
        <AdminStatCard label="Withdrawals Today" value={formatCents(summary.withdrawalsTodayCents)} accent="muted" />
        <AdminStatCard label="Pending" value={summary.pendingCount} accent="gold" />
        <AdminStatCard label="Failed" value={summary.failedCount} accent="purple" />
        <AdminStatCard label="Completed Today" value={summary.completedTodayCount} accent="success" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Active Wallets" value={summary.walletTotalWallets} accent="purple" />
        <AdminStatCard
          label="Avg Available"
          value={formatCents(summary.walletAvgAvailableCents)}
          accent="success"
        />
        <AdminStatCard
          label="Wallet Utilization"
          value={`${summary.walletUtilizationPercent}%`}
          accent="gold"
        />
        <AdminStatCard
          label="Lifetime Withdrawals"
          value={formatCents(summary.walletLifetimeWithdrawalsCents)}
          accent="muted"
        />
      </div>

      <LandingGlassCard className="p-4 sm:p-5">
        <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
        {summary.recentTransactions.length === 0 ? (
          <p className="text-sm text-sb-muted">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sb-muted text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">Player</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/[0.04]">
                    <td className="py-2.5 pr-4 text-sb-muted tabular-nums">{formatDate(tx.createdAt)}</td>
                    <td className="py-2.5 pr-4 text-white">{tx.playerEmail}</td>
                    <td className="py-2.5 pr-4 text-sb-secondary">{tx.transactionType}</td>
                    <td className="py-2.5 pr-4 text-sb-glow tabular-nums">{formatCents(tx.amountCents)}</td>
                    <td className="py-2.5">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LandingGlassCard>

      <Link href="/admin/financial" className="text-sm text-sb-glow hover:text-white">
        Legacy Financial Status →
      </Link>
    </div>
  );
}
