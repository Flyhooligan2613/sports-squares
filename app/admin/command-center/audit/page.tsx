"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import CommandCenterSyncBanner from "@/components/admin/commandCenter/CommandCenterSyncBanner";
import type { CommandCenterAuditEntry } from "@/lib/platform/engines/commandCenter";
import { getDemoAuditEntries } from "@/lib/platform/engines/commandCenter/mockData";
import { useCommandCenterHydration } from "@/hooks/useCommandCenterHydration";

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

function parseAudit(body: Record<string, unknown>) {
  if (Array.isArray(body.entries)) {
    return {
      value: body.entries as CommandCenterAuditEntry[],
      demo: Boolean(body.demo),
    };
  }
  return null;
}

export default function CommandCenterAuditPage() {
  const { data: entries, hydrating, usingDemo } = useCommandCenterHydration({
    url: "/api/admin/command-center/audit?limit=150",
    initialData: getDemoAuditEntries(),
    parse: parseAudit,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Audit Logs</h2>
        <p className="text-sm text-sb-muted mt-1">
          Reuses <code className="text-sb-glow">platform_audit_log</code> — immutable event stream.
        </p>
      </div>

      <CommandCenterSyncBanner hydrating={hydrating} usingDemo={usingDemo} />

      {entries.length === 0 ? (
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
