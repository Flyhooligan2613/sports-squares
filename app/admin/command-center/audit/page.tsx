"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { CommandCenterAuditEntry } from "@/lib/platform/engines/commandCenter";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export default function CommandCenterAuditPage() {
  const [entries, setEntries] = useState<CommandCenterAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/command-center/audit?limit=150")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { entries: CommandCenterAuditEntry[] };
          setEntries(data.entries);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Audit Logs</h2>
        <p className="text-sm text-sb-muted mt-1">
          Reuses <code className="text-sb-glow">platform_audit_log</code> — immutable event stream.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted text-sm">
          No audit events yet.
        </LandingGlassCard>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <LandingGlassCard key={entry.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-sb-glow bg-sb-purple/10 border border-sb-purple/25 rounded-full px-2 py-0.5">
                  {entry.eventType}
                </span>
                <time className="text-xs text-sb-muted">{formatDate(entry.createdAt)}</time>
              </div>
              <p className="text-sm text-white">{entry.summary}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-sb-muted">
                {entry.gameType ? <span>Game: {entry.gameType}</span> : null}
                {entry.actorRole ? <span>Actor: {entry.actorRole}</span> : null}
                {entry.actorEmail ? <span>{entry.actorEmail}</span> : null}
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
