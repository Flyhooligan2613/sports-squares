"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";
import {
  WALLET_HISTORY_TABS,
  type WalletHistoryCategory,
} from "@/lib/platform/engines/payment/wallet/ledgerCategories";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface WalletHistoryTabsProps {
  initialCategory?: WalletHistoryCategory;
}

export default function WalletHistoryTabs({
  initialCategory = "deposits",
}: WalletHistoryTabsProps) {
  const [category, setCategory] = useState<WalletHistoryCategory>(initialCategory);
  const [entries, setEntries] = useState<SquareWalletLedgerEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Could not load history.");
        setEntries([]);
        return;
      }
      const data = (await res.json()) as { entries: SquareWalletLedgerEntry[] };
      setEntries(data.entries);
    } catch {
      setError("Could not load history.");
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
        e.balanceType.includes(q)
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
    <LandingGlassCard className="p-6">
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
              "shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40",
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
        placeholder="Search this history…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
      />

      {loading ? (
        <ul className="space-y-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </ul>
      ) : error ? (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 px-4">
          <p className="text-white font-medium mb-1">{activeTab.emptyTitle}</p>
          <p className="text-sm text-sb-muted">{activeTab.emptyBody}</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
          {filtered.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04] text-sm"
            >
              <div className="min-w-0">
                <p className="text-white truncate">
                  {tx.description ?? tx.entryType.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-sb-muted">{formatDate(tx.createdAt)}</p>
              </div>
              <span
                className={`tabular-nums font-medium shrink-0 ${
                  tx.direction === "credit" ? "text-emerald-300" : "text-sb-muted"
                }`}
              >
                {tx.direction === "credit" ? "+" : "−"}
                {formatCents(tx.amountCents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </LandingGlassCard>
  );
}
