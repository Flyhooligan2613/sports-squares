"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatUserError } from "@/lib/errors/formatUserError";
import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";
import { WALLET_COPY, WALLET_STATUS_LABELS } from "@/lib/platform/language/walletLanguage";
import TransactionDetailModal from "./TransactionDetailModal";
import {
  formatWalletCents,
  formatWalletDateTime,
  formatWalletType,
  resolvePaymentMethod,
  resolveReferenceId,
  resolveTransactionStatus,
  statusBadgeVariant,
} from "./walletTransactionUtils";

interface TransactionHistoryProps {
  initialEntries: SquareWalletLedgerEntry[];
}

export default function TransactionHistory({ initialEntries }: TransactionHistoryProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SquareWalletLedgerEntry | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.entryType.toLowerCase().includes(q) ||
        e.balanceType.includes(q) ||
        resolveReferenceId(e).toLowerCase().includes(q)
    );
  }, [entries, search]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/square-wallet/transactions?limit=50&search=${encodeURIComponent(search)}`
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(formatUserError(body.error ?? "load failed", "wallet"));
        return;
      }
      const data = (await res.json()) as { entries: SquareWalletLedgerEntry[] };
      setEntries(data.entries);
    } catch (err) {
      setError(formatUserError(err, "wallet"));
    } finally {
      setLoading(false);
    }
  }

  async function exportStub() {
    await fetch("/api/square-wallet/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv" }),
    });
  }

  return (
    <>
      <TransactionDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />

      <LandingGlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            Transaction History
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void exportStub()}>
              Export
            </Button>
          </div>
        </div>

        <input
          type="search"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transactions"
          className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 min-h-[44px] text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
        />

        {loading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sb-xp-skeleton h-16 rounded-xl" />
            ))}
            <BrandedLoadingLabel context="wallet" className="text-center text-sb-muted text-sm py-2" />
          </div>
        ) : error ? (
          <p className="text-sm text-amber-200/90 text-center py-8" role="alert">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-sb-muted text-center py-8">{WALLET_COPY.emptyTransactions}</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((tx) => {
              const status = resolveTransactionStatus(tx);
              const paymentMethod = resolvePaymentMethod(tx);
              return (
                <li key={tx.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(tx)}
                    className="w-full flex items-center justify-between gap-3 py-3 px-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.03] text-sm text-left min-h-[56px] sb-card-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
                    aria-label={`View ${formatWalletType(tx)} transaction`}
                  >
                    <div className="min-w-0">
                      <p className="text-white font-medium">{formatWalletType(tx)}</p>
                      <p className="text-xs text-sb-muted">{formatWalletDateTime(tx.createdAt)}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StatusBadge variant={statusBadgeVariant(status)} dot={status === "processing"}>
                          {WALLET_STATUS_LABELS[status]}
                        </StatusBadge>
                        <span className="text-[10px] text-sb-muted font-mono">
                          {resolveReferenceId(tx)}
                        </span>
                        {paymentMethod ? (
                          <span className="text-[10px] text-sb-muted">{paymentMethod}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`tabular-nums font-medium ${
                          tx.direction === "credit" ? "text-emerald-300" : "text-sb-muted"
                        }`}
                      >
                        {tx.direction === "credit" ? "+" : "−"}
                        {formatWalletCents(tx.amountCents)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-sb-muted" aria-hidden />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </LandingGlassCard>
    </>
  );
}
