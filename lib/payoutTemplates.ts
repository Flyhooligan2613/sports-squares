import { getScoringPeriods } from "@/lib/espn/sports";
import type {
  EspnSport,
  PayoutPercentages,
  PayoutTemplate,
  Pool,
  ScoringPeriod,
} from "./types";

export const PAYOUT_TEMPLATE_LABELS: Record<PayoutTemplate, string> = {
  equal: "Equal",
  standard: "Standard",
  heavy_final: "Heavy Final",
  custom: "Custom",
};

/** Five-period templates (NFL, NCAAF, NBA). */
const FIVE_PERIOD_TEMPLATES: Record<
  Exclude<PayoutTemplate, "custom">,
  PayoutPercentages
> = {
  equal: { Q1: 20, Q2: 20, Q3: 20, Q4: 20, FINAL: 20 },
  standard: { Q1: 16.67, Q2: 16.67, Q3: 16.67, Q4: 16.67, FINAL: 33.32 },
  heavy_final: { Q1: 10, Q2: 10, Q3: 10, Q4: 20, FINAL: 50 },
};

/** Three-period templates (NCAA Basketball). */
const THREE_PERIOD_TEMPLATES: Record<
  Exclude<PayoutTemplate, "custom">,
  PayoutPercentages
> = {
  equal: { "1H": 33.33, "2H": 33.33, FINAL: 33.34 },
  standard: { "1H": 25, "2H": 25, FINAL: 50 },
  heavy_final: { "1H": 10, "2H": 10, FINAL: 80 },
};

export function getTemplatePercentages(
  template: Exclude<PayoutTemplate, "custom">,
  sport?: EspnSport | null
): PayoutPercentages {
  const periods = getScoringPeriods(sport);
  const source =
    periods.length === 3 ? THREE_PERIOD_TEMPLATES : FIVE_PERIOD_TEMPLATES;
  const raw = source[template];
  return pickPercentagesForPeriods(raw, periods);
}

export function pickPercentagesForPeriods(
  percentages: PayoutPercentages,
  periods: ScoringPeriod[]
): PayoutPercentages {
  const result: PayoutPercentages = {};
  for (const period of periods) {
    if (percentages[period] !== undefined) {
      result[period] = percentages[period];
    }
  }
  return result;
}

export function resolvePoolPayoutPercentages(pool: Pool): PayoutPercentages {
  const periods = getScoringPeriods(pool.espnSport);
  const template = pool.payoutTemplate ?? "standard";

  if (template === "custom" && pool.payoutPercentages) {
    return pickPercentagesForPeriods(pool.payoutPercentages, periods);
  }

  if (template !== "custom") {
    return getTemplatePercentages(template, pool.espnSport);
  }

  return getTemplatePercentages("standard", pool.espnSport);
}

export function sumPercentages(percentages: PayoutPercentages): number {
  return Object.values(percentages).reduce((sum, value) => sum + (value ?? 0), 0);
}

export function validatePayoutPercentages(
  percentages: PayoutPercentages,
  periods: ScoringPeriod[]
): { ok: true } | { ok: false; error: string } {
  const missing = periods.filter((p) => percentages[p] === undefined);
  if (missing.length > 0) {
    return { ok: false, error: `Missing percentages for: ${missing.join(", ")}` };
  }

  for (const period of periods) {
    const value = percentages[period]!;
    if (Number.isNaN(value) || value < 0) {
      return { ok: false, error: `${period} must be 0% or greater.` };
    }
  }

  const total = sumPercentages(pickPercentagesForPeriods(percentages, periods));
  if (Math.abs(total - 100) > 0.05) {
    return {
      ok: false,
      error: `Percentages must total 100% (currently ${total.toFixed(2)}%).`,
    };
  }

  return { ok: true };
}

export function buildPayoutConfig(
  template: PayoutTemplate,
  sport: EspnSport | undefined,
  customPercentages?: PayoutPercentages
): { template: PayoutTemplate; percentages: PayoutPercentages } {
  const periods = getScoringPeriods(sport);

  if (template === "custom") {
    const percentages = pickPercentagesForPeriods(
      customPercentages ?? {},
      periods
    );
    const validation = validatePayoutPercentages(percentages, periods);
    if (!validation.ok) {
      throw new Error(validation.error);
    }
    return { template, percentages };
  }

  return {
    template,
    percentages: getTemplatePercentages(template, sport),
  };
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2).replace(/\.?0+$/, "")}%`;
}
