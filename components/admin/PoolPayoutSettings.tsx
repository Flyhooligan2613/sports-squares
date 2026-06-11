"use client";

import { useEffect, useMemo, useState } from "react";
import { getScoringPeriods } from "@/lib/espn/sports";
import {
  calcPeriodPayoutsForPool,
  calcPoolSummary,
  formatCurrency,
} from "@/lib/poolFinance";
import {
  PAYOUT_TEMPLATE_LABELS,
  buildPayoutConfig,
  formatPercent,
  getTemplatePercentages,
  resolvePoolPayoutPercentages,
  sumPercentages,
  validatePayoutPercentages,
} from "@/lib/payoutTemplates";
import { poolStore } from "@/lib/poolStore";
import type {
  PayoutPercentages,
  PayoutTemplate,
  Pool,
  ScoringPeriod,
} from "@/lib/types";

interface PoolPayoutSettingsProps {
  pool: Pool;
  onUpdate: () => void | Promise<void>;
  disabled?: boolean;
}

const TEMPLATE_OPTIONS: PayoutTemplate[] = [
  "equal",
  "standard",
  "heavy_final",
  "custom",
];

const TEMPLATE_DESCRIPTIONS: Record<Exclude<PayoutTemplate, "custom">, string> =
  {
    equal: "Each period receives an equal share of the prize pool.",
    standard: "Quarters share equally; FINAL receives double a quarter share.",
    heavy_final: "Earlier periods receive less; FINAL receives half the pool.",
  };

function percentagesToInputs(
  percentages: PayoutPercentages,
  periods: ScoringPeriod[]
): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const period of periods) {
    inputs[period] =
      percentages[period] !== undefined ? String(percentages[period]) : "";
  }
  return inputs;
}

export default function PoolPayoutSettings({
  pool,
  onUpdate,
  disabled = false,
}: PoolPayoutSettingsProps) {
  const periods = getScoringPeriods(pool.espnSport);
  const [template, setTemplate] = useState<PayoutTemplate>(
    pool.payoutTemplate ?? "standard"
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>(() =>
    percentagesToInputs(resolvePoolPayoutPercentages(pool), periods)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTemplate(pool.payoutTemplate ?? "standard");
    setCustomInputs(
      percentagesToInputs(resolvePoolPayoutPercentages(pool), periods)
    );
  }, [pool.payoutTemplate, pool.payoutPercentages, pool.espnSport]);

  const activePercentages = useMemo(() => {
    if (template === "custom") {
      const custom: PayoutPercentages = {};
      for (const period of periods) {
        custom[period] = parseFloat(customInputs[period] ?? "") || 0;
      }
      return custom;
    }
    return getTemplatePercentages(template, pool.espnSport);
  }, [template, customInputs, periods, pool.espnSport]);

  const totalPercent = useMemo(
    () => sumPercentages(activePercentages),
    [activePercentages]
  );

  const previewPool: Pool = {
    ...pool,
    payoutTemplate: template,
    payoutPercentages: activePercentages,
  };
  const summary = calcPoolSummary(previewPool);
  const payouts = calcPeriodPayoutsForPool(previewPool, periods);

  function handleTemplateChange(next: PayoutTemplate) {
    setTemplate(next);
    setError("");
    if (next !== "custom") {
      const nextPercentages = getTemplatePercentages(next, pool.espnSport);
      setCustomInputs(percentagesToInputs(nextPercentages, periods));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    let config;
    try {
      if (template === "custom") {
        const custom: PayoutPercentages = {};
        for (const period of periods) {
          custom[period] = parseFloat(customInputs[period] ?? "") || 0;
        }
        const validation = validatePayoutPercentages(custom, periods);
        if (!validation.ok) {
          setError(validation.error);
          return;
        }
        config = buildPayoutConfig("custom", pool.espnSport, custom);
      } else {
        config = buildPayoutConfig(template, pool.espnSport);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid payout settings.");
      return;
    }

    setSaving(true);
    const updated = await poolStore.updatePoolPayoutSettings(pool.id, {
      payoutTemplate: config.template,
      payoutPercentages: config.percentages,
    });
    setSaving(false);

    if (!updated) {
      setError(
        "Could not save payout settings. Run migration 007_payout_templates.sql in Supabase if you have not already."
      );
      return;
    }

    await onUpdate();
    setMessage("Payout settings saved. Winner payouts recalculated.");
    setTimeout(() => setMessage(""), 4000);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">
          Pool Payout Settings
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Choose how the prize pool is split across scoring periods.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-2">
          {TEMPLATE_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                template === option
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700 hover:border-slate-600"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name="payoutTemplate"
                value={option}
                checked={template === option}
                onChange={() => handleTemplateChange(option)}
                disabled={disabled}
                className="mt-0.5 accent-indigo-500"
              />
              <span>
                <span className="text-sm text-slate-200 font-medium block">
                  {PAYOUT_TEMPLATE_LABELS[option]}
                </span>
                {option !== "custom" && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {TEMPLATE_DESCRIPTIONS[option]}
                  </span>
                )}
                {option === "custom" && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Enter percentages manually (must total 100%).
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400">
                <th className="text-left px-3 py-2 font-medium">Period</th>
                <th className="text-right px-3 py-2 font-medium">Share</th>
                <th className="text-right px-3 py-2 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period} className="border-t border-slate-800">
                  <td className="px-3 py-2 text-slate-300 font-medium">
                    {period}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {template === "custom" ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={customInputs[period] ?? ""}
                          onChange={(e) =>
                            setCustomInputs((prev) => ({
                              ...prev,
                              [period]: e.target.value,
                            }))
                          }
                          disabled={disabled}
                          className="w-20 bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded px-2 py-1 text-right text-slate-200 outline-none"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">
                        {formatPercent(activePercentages[period] ?? 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-amber-300 font-mono">
                    {formatCurrency(payouts[period] ?? 0)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-700 bg-slate-800/40">
                <td className="px-3 py-2 text-slate-200 font-semibold">Total</td>
                <td
                  className={`px-3 py-2 text-right font-mono font-semibold ${
                    Math.abs(totalPercent - 100) <= 0.05
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {totalPercent.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right text-amber-300 font-mono font-semibold">
                  {formatCurrency(summary.prizePool)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500">
          Payout preview based on current prize pool of{" "}
          <span className="text-amber-300 font-mono">
            {formatCurrency(summary.prizePool)}
          </span>
          .
        </p>

        <button
          type="submit"
          disabled={disabled || saving || Math.abs(totalPercent - 100) > 0.05}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-lg font-medium"
        >
          {saving ? "Saving..." : "Save Payout Settings"}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </div>
  );
}
