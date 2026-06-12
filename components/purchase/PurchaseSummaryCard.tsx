"use client";

import type { PurchaseSuccessSummary } from "@/lib/purchases/successSummary";
import { formatCurrency } from "@/lib/purchases/successSummary";
import LandingGlassCard from "@/components/landing/LandingGlassCard";

interface PurchaseSummaryCardProps {
  summary: PurchaseSuccessSummary;
}

export default function PurchaseSummaryCard({ summary }: PurchaseSummaryCardProps) {
  const rows = [
    {
      label: "Game",
      value: `${summary.awayTeam} vs ${summary.homeTeam}`,
    },
    { label: "Board", value: `Board #${summary.boardIndex}` },
    {
      label: "Squares Purchased",
      value: String(summary.squaresPurchased),
    },
    { label: "Total Paid", value: formatCurrency(summary.totalPaid), accent: true },
    { label: "Kickoff", value: summary.kickoffLabel },
  ];

  return (
    <LandingGlassCard className="purchase-summary-card p-5 sm:p-6 text-left">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-sb-muted mb-4">
        Your purchase
      </h3>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
          >
            <dt className="text-sm text-sb-muted">{row.label}</dt>
            <dd
              className={[
                "text-sm font-semibold text-right",
                row.accent ? "text-sb-gold tabular-nums" : "text-white",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </LandingGlassCard>
  );
}
