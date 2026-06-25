"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatUserError } from "@/lib/errors/formatUserError";
import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";
import {
  WALLET_HISTORY_TABS,
  type WalletHistoryCategory,
} from "@/lib/platform/engines/payment/wallet/ledgerCategories";
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

interface WalletHistoryTabsProps {
  initialCategory?: WalletHistoryCategory;
}

export default function WalletHistoryTabs({
  initialCategory = "all",
}: WalletHistoryTabsProps) {
  const [category, setCategory] = useState<WalletHistoryCategory>(initialCategory);
  const [entries, setEntries] = useState<SquareWalletLedgerEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SquareWalletLedgerEntry | null>(null);

  const activeTab = WALLET_HISTORY_TABS.find((tab) => tab.id === category) ?? WALLET_HISTORY_TABS[0];

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: "50",
        category,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/square-wallet/history?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(formatUserError(body.error ?? "load failed", "wallet"));
        setEntries([]);
        return;
      }
      const data = (await res.json()) as { entries: SquareWalletLedgerEntry[] };
      setEntries(data.entries);
    } catch (err) {
      setError(formatUserError(err, "wallet"));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

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

  async function exportStub() {
    await fetch("/api/square-wallet/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", category }),
    });
  }

  return (
    <>
      <TransactionDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />

      <LandingGlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            SquareWallet™ History
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => void loadEntries()} disabled={loading}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void exportStub()}>
              Export
            </Button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-none">
          {WALLET_HISTORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              aria-label={`History filter: ${tab.label}`}
              aria-pressed={category === tab.id}
              className={[
                "shrink-0 text-xs px-3 py-2 min-h-[36px] rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40",
                category === tab.id
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-transparent text-sb-muted hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search by type, description, or reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transaction history"
          className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 min-h-[44px] text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
        />

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sb-xp-skeleton h-20 sm:h-14 rounded-xl" />
            ))}
            <BrandedLoadingLabel context="wallet" className="text-center text-sb-muted text-sm py-2" />
          </div>
        ) : error ? (
          <p className="text-sm text-amber-200/90 text-center py-8" role="alert">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-white font-medium mb-1">
              {category === "all" ? "No transactions yet" : activeTab.emptyTitle}
            </p>
            <p className="text-sm text-sb-muted max-w-sm mx-auto">
              {category === "all" ? WALLET_COPY.emptyTransactions : activeTab.emptyBody}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-sb-muted border-b border-white/[0.06]">
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 pr-3 font-medium">Amount</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Date & Time</th>
                    <th className="pb-2 pr-3 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 w-8" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const status = resolveTransactionStatus(tx);
                    const paymentMethod = resolvePaymentMethod(tx);
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        onClick={() => setSelectedEntry(tx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedEntry(tx);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${formatWalletType(tx)} transaction for ${formatWalletCents(tx.amountCents)}`}
                      >
                        <td className="py-3 pr-3 text-white">{formatWalletType(tx)}</td>
                        <td
                          className={`py-3 pr-3 tabular-nums font-medium ${
                            tx.direction === "credit" ? "text-emerald-300" : "text-sb-muted"
                          }`}
                        >
                          {tx.direction === "credit" ? "+" : "−"}
                          {formatWalletCents(tx.amountCents)}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge variant={statusBadgeVariant(status)} dot={status === "processing"}>
                            {WALLET_STATUS_LABELS[status]}
                          </StatusBadge>
                        </td>
                        <td className="py-3 pr-3 text-sb-muted text-xs whitespace-nowrap">
                          {formatWalletDateTime(tx.createdAt)}
                        </td>
                        <td className="py-3 pr-3 text-xs text-sb-muted font-mono truncate max-w-[8rem]">
                          {resolveReferenceId(tx)}
                        </td>
                        <td className="py-3 text-xs text-sb-muted">{paymentMethod ?? "—"}</td>
                        <td className="py-3 text-sb-muted group-hover:text-white">
                          <ChevronRight className="w-4 h-4" aria-hidden />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="sm:hidden space-y-2 max-h-[28rem] overflow-y-auto">
              {filtered.map((tx) => {
                const status = resolveTransactionStatus(tx);
                const paymentMethod = resolvePaymentMethod(tx);
                return (
                  <li key={tx.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(tx)}
                      className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 min-h-[72px] sb-card-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40 active:scale-[0.99] transition-transform"
                      aria-label={`View ${formatWalletType(tx)} transaction`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm">{formatWalletType(tx)}</p>
                          <p className="text-xs text-sb-muted mt-0.5">{formatWalletDateTime(tx.createdAt)}</p>
                        </div>
                        <span
                          className={`tabular-nums font-semibold shrink-0 ${
                            tx.direction === "credit" ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {tx.direction === "credit" ? "+" : "−"}
                          {formatWalletCents(tx.amountCents)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge variant={statusBadgeVariant(status)} dot={status === "processing"}>
                          {WALLET_STATUS_LABELS[status]}
                        </StatusBadge>
                        <span className="text-[10px] text-sb-muted font-mono truncate">
                          Ref: {resolveReferenceId(tx)}
                        </span>
                        {paymentMethod ? (
                          <span className="text-[10px] text-sb-muted">{paymentMethod}</span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </LandingGlassCard>
    </>
  );
}
