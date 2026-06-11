"use client";

import { useEffect, useState } from "react";
import { calcPoolSummary, formatCurrency } from "@/lib/poolFinance";
import type { Pool } from "@/lib/types";
import { poolStore } from "@/lib/poolStore";

interface PoolFinancialSettingsProps {
  pool: Pool;
  onUpdate: (pool: Pool) => void;
  disabled?: boolean;
}

export default function PoolFinancialSettings({
  pool,
  onUpdate,
  disabled = false,
}: PoolFinancialSettingsProps) {
  const [costPerSquare, setCostPerSquare] = useState(
    String(pool.costPerSquare ?? 0)
  );
  const [serviceFeePercent, setServiceFeePercent] = useState(
    String(pool.serviceFeePercent ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCostPerSquare(String(pool.costPerSquare ?? 0));
    setServiceFeePercent(String(pool.serviceFeePercent ?? 0));
  }, [pool.costPerSquare, pool.serviceFeePercent]);

  const previewPool: Pool = {
    ...pool,
    costPerSquare: parseFloat(costPerSquare) || 0,
    serviceFeePercent: parseFloat(serviceFeePercent) || 0,
  };
  const preview = calcPoolSummary(previewPool);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const cost = parseFloat(costPerSquare);
    const fee = parseFloat(serviceFeePercent);
    if (Number.isNaN(cost) || cost < 0 || Number.isNaN(fee) || fee < 0 || fee > 100) {
      return;
    }

    setSaving(true);
    setMessage("");
    const updated = await poolStore.updatePoolFinancials(pool.id, {
      costPerSquare: cost,
      serviceFeePercent: fee,
    });
    setSaving(false);

    if (!updated) {
      setMessage(
        "Could not save financial settings. Run migration 006_pool_financials.sql in Supabase if you have not already."
      );
      return;
    }

    onUpdate(updated);
    setMessage("Financial settings saved. Winner payouts recalculated.");
    setTimeout(() => setMessage(""), 4000);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">Pool Settings</h2>
        <p className="text-slate-500 text-xs mt-1">
          Entry fees and prize pool calculation.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="costPerSquare"
            className="text-slate-400 text-xs font-medium block mb-1.5"
          >
            Cost Per Square ($)
          </label>
          <input
            id="costPerSquare"
            type="number"
            min={0}
            step="0.01"
            value={costPerSquare}
            onChange={(e) => setCostPerSquare(e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="serviceFeePercent"
            className="text-slate-400 text-xs font-medium block mb-1.5"
          >
            Service Fee (%)
          </label>
          <input
            id="serviceFeePercent"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={serviceFeePercent}
            onChange={(e) => setServiceFeePercent(e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none disabled:opacity-50"
          />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
          <button
            type="submit"
            disabled={disabled || saving}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              Revenue:{" "}
              <span className="text-slate-300 font-mono">
                {formatCurrency(preview.totalRevenue)}
              </span>
            </span>
            <span>
              Service Fee:{" "}
              <span className="text-slate-300 font-mono">
                {formatCurrency(preview.serviceFee)}
              </span>
            </span>
            <span>
              Prize Pool:{" "}
              <span className="text-amber-300 font-mono">
                {formatCurrency(preview.prizePool)}
              </span>
            </span>
          </p>
        </div>
      </form>

      {message && (
        <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </div>
  );
}
