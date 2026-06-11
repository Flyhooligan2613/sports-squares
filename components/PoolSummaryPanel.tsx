"use client";

import { useMemo } from "react";
import { calcPoolSummary, formatCurrency } from "@/lib/poolFinance";
import type { Pool } from "@/lib/types";

interface PoolSummaryPanelProps {
  pool: Pool;
}

export default function PoolSummaryPanel({ pool }: PoolSummaryPanelProps) {
  const summary = useMemo(() => calcPoolSummary(pool), [pool]);

  if ((pool.costPerSquare ?? 0) <= 0) return null;

  return (
    <section
      className="bg-slate-900 border border-slate-800 rounded-xl p-5"
      aria-label="Pool summary"
    >
      <h2 className="text-slate-200 font-semibold text-sm mb-4">Pool Summary</h2>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryItem
          label="Credits Allocated"
          value={String(summary.allocatedCredits)}
        />
        <SummaryItem
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          highlight
        />
        <SummaryItem
          label="Service Fee"
          value={formatCurrency(summary.serviceFee)}
        />
        <SummaryItem
          label="Prize Pool"
          value={formatCurrency(summary.prizePool)}
          accent
        />
      </dl>
    </section>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </dt>
      <dd
        className={`mt-1 text-lg font-bold font-mono ${
          accent
            ? "text-amber-300"
            : highlight
              ? "text-slate-100"
              : "text-slate-300"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
