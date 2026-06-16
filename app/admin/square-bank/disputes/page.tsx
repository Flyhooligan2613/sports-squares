"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";
import type { SquareBankDisputeRecord } from "@/lib/platform/engines/squareBank";

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

export default function SquareBankDisputesPage() {
  const [disputes, setDisputes] = useState<SquareBankDisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/square-bank/disputes?limit=50")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { disputes: SquareBankDisputeRecord[] };
          setDisputes(data.disputes);
        }
      })
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonKpiGrid count={3} />;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/command-center/finance" className="text-sm text-sb-muted hover:text-white">
          ← Financial Health
        </Link>
        <h1 className="text-xl font-semibold text-white mt-2">SquareBank Dispute Center</h1>
        <p className="text-sm text-sb-muted mt-1">
          Transaction details, timeline, and resolution notes — admin only.
        </p>
      </div>

      <LandingGlassCard className="p-4 sm:p-5">
        {disputes.length === 0 ? (
          <p className="text-sm text-sb-muted">No open disputes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sb-muted text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="pb-2 pr-4">Opened</th>
                  <th className="pb-2 pr-4">Player</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Ledger</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} className="border-b border-white/[0.04]">
                    <td className="py-2.5 pr-4 text-sb-muted tabular-nums">{formatDate(d.createdAt)}</td>
                    <td className="py-2.5 pr-4 text-white">{d.playerEmail}</td>
                    <td className="py-2.5 pr-4 text-sb-glow tabular-nums">{formatCents(d.amountCents)}</td>
                    <td className="py-2.5 pr-4">{d.status}</td>
                    <td className="py-2.5 pr-4 text-sb-secondary">{d.disputeType}</td>
                    <td className="py-2.5 font-mono text-xs text-sb-muted">{d.ledgerEntryId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LandingGlassCard>
    </div>
  );
}
