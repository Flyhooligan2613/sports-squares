import PageHeader from "@/components/ui/PageHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { listPlatformAuditLog } from "@/lib/platform/core/auditLog";

export const dynamic = "force-dynamic";

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

export default async function AdminAuditLogPage() {
  let entries: Awaited<ReturnType<typeof listPlatformAuditLog>> = [];

  try {
    entries = await listPlatformAuditLog({ limit: 150 });
  } catch {
    // platform_audit_log may not exist until migration 023.
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Immutable-style event stream for platform monitoring."
      />

      {entries.length === 0 ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted text-sm">
          No audit events yet. Apply migration 023 to enable the audit log table.
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
                {entry.entityType && entry.entityId ? (
                  <span>
                    {entry.entityType}: {entry.entityId.slice(0, 8)}…
                  </span>
                ) : null}
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
