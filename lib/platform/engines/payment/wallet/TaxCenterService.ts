import { listLedgerEntries } from "./repository";
import { findWalletByEmail } from "./repository";
import type { TaxYearSummaryStub } from "./types";

/** TaxCenter stub — yearly stats and export hooks for future ComplianceEngine. */
export async function getYearlySummary(email: string, year: number): Promise<TaxYearSummaryStub> {
  const wallet = await findWalletByEmail(email);
  if (!wallet) {
    return {
      year,
      depositsCents: 0,
      withdrawalsCents: 0,
      winningsCents: 0,
      contestEntriesCents: 0,
      exportAvailable: false,
    };
  }

  const start = `${year}-01-01T00:00:00.000Z`;
  const end = `${year + 1}-01-01T00:00:00.000Z`;
  const entries = await listLedgerEntries({ walletId: wallet.id, limit: 5000 });

  let depositsCents = 0;
  let withdrawalsCents = 0;
  let winningsCents = 0;
  let contestEntriesCents = 0;

  for (const e of entries) {
    if (e.createdAt < start || e.createdAt >= end) continue;
    if (e.direction !== "debit" && e.direction !== "credit") continue;

    const amt = e.amountCents;
    if (e.entryType === "deposit" && e.direction === "credit") depositsCents += amt;
    if (e.entryType === "withdrawal_complete" && e.direction === "debit") withdrawalsCents += amt;
    if (e.entryType === "winnings_credit" && e.direction === "credit") winningsCents += amt;
    if (e.entryType === "contest_entry" && e.direction === "debit") contestEntriesCents += amt;
  }

  return {
    year,
    depositsCents,
    withdrawalsCents,
    winningsCents,
    contestEntriesCents,
    exportAvailable: entries.length > 0,
  };
}

export async function exportTransactionsStub(input: {
  email: string;
  year?: number;
  format?: "csv" | "json";
}): Promise<{ ok: boolean; message: string; rowCount: number }> {
  const wallet = await findWalletByEmail(input.email);
  if (!wallet) {
    return { ok: false, message: "No wallet found.", rowCount: 0 };
  }

  const entries = await listLedgerEntries({ walletId: wallet.id, limit: 5000 });
  const filtered = input.year
    ? entries.filter((e) => new Date(e.createdAt).getFullYear() === input.year)
    : entries;

  return {
    ok: true,
    message: `Export stub — ${filtered.length} transactions ready for ComplianceEngine.`,
    rowCount: filtered.length,
  };
}
