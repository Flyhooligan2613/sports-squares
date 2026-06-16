"use client";

import { useMemo, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { SquareWalletLedgerEntry } from "@/lib/platform/engines/payment/wallet";

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

interface TransactionHistoryProps {
  initialEntries: SquareWalletLedgerEntry[];
}

export default function TransactionHistory({ initialEntries }: TransactionHistoryProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/square-wallet/transactions?limit=50&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = (await res.json()) as { entries: SquareWalletLedgerEntry[] };
        setEntries(data.entries);
      }
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
    <LandingGlassCard className="p-6">
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
        className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-sb-muted text-center py-8">No transactions yet.</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04] text-sm"
            >
              <div>
                <p className="text-white">{tx.description ?? tx.entryType.replace(/_/g, " ")}</p>
                <p className="text-xs text-sb-muted">{formatDate(tx.createdAt)}</p>
              </div>
              <span
                className={`tabular-nums font-medium ${
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
