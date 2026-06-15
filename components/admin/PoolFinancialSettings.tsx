"use client";

import { calcPoolSummary, formatCurrency } from "@/lib/poolFinance";
import { formatTierCents, normalizeEntryTierCents } from "@/lib/platform/core/entryTiers";
import {
  PLATFORM_PRICING_LOCKED,
  formatHostingFeePercent,
  resolvePoolHostingFeePercent,
} from "@/lib/platform/core/platformFeeSchedule";
import type { Pool } from "@/lib/types";

interface PoolFinancialSettingsProps {
  pool: Pool;
  onUpdate?: (pool: Pool) => void;
  disabled?: boolean;
}

export default function PoolFinancialSettings({ pool }: PoolFinancialSettingsProps) {
  const entryTierCents = normalizeEntryTierCents(
    pool.entryTierCents ?? Math.round((pool.costPerSquare ?? 0) * 100)
  );
  const hostingFeePercent = resolvePoolHostingFeePercent({
    entryTierCents: pool.entryTierCents,
    costPerSquare: pool.costPerSquare,
  });
  const preview = calcPoolSummary(pool);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">Pool financials (read-only)</h2>
        <p className="text-slate-500 text-xs mt-1">{PLATFORM_PRICING_LOCKED}</p>
      </div>

      <dl className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500 text-xs font-medium mb-1">Entry tier</dt>
          <dd className="text-slate-200 font-mono">{formatTierCents(entryTierCents)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs font-medium mb-1">Cost per square</dt>
          <dd className="text-slate-200 font-mono">{formatCurrency(pool.costPerSquare ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs font-medium mb-1">Platform hosting fee</dt>
          <dd className="text-slate-200 font-mono">
            {formatHostingFeePercent(entryTierCents)} (fixed)
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 text-xs font-medium mb-1">Prize pool share</dt>
          <dd className="text-emerald-300 font-mono">{100 - hostingFeePercent}%</dd>
        </div>
      </dl>

      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          Revenue:{" "}
          <span className="text-slate-300 font-mono">{formatCurrency(preview.totalRevenue)}</span>
        </span>
        <span>
          Hosting:{" "}
          <span className="text-slate-300 font-mono">{formatCurrency(preview.serviceFee)}</span>
        </span>
        <span>
          Prize pool:{" "}
          <span className="text-amber-300 font-mono">{formatCurrency(preview.prizePool)}</span>
        </span>
      </p>
    </div>
  );
}
