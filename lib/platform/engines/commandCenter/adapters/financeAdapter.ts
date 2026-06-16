import { SquareBankEngine } from "@/lib/platform/engines/squareBank";
import type { FinancialHealthSummary } from "../types";

export async function fetchFinancialHealthSummary(): Promise<FinancialHealthSummary> {
  const empty: FinancialHealthSummary = {
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
    reconciliationMismatchCount: 0,
  };

  try {
    const [metrics, reconciliation] = await Promise.all([
      SquareBankEngine.getHealthMetrics(),
      SquareBankEngine.runReconciliation("daily").catch(() => ({
        mismatchCount: 0,
      })),
    ]);

    return {
      ...metrics,
      reconciliationMismatchCount: reconciliation.mismatchCount ?? 0,
    };
  } catch {
    return empty;
  }
}
