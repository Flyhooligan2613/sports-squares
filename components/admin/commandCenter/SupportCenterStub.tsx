"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";
import { SkeletonKpiGrid } from "@/components/ui/Skeleton";

interface SupportThreadRow {
  id: string;
  userEmail: string;
  subject: string;
  status: string;
  priority?: string;
  category: string;
  updatedAt: string;
}

function priorityClass(priority?: string): string {
  if (priority === "high") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  if (priority === "low") return "text-sb-muted bg-white/5 border-white/10";
  return "text-blue-300 bg-blue-500/10 border-blue-500/25";
}

export default function SupportCenterStub() {
  const [threads, setThreads] = useState<SupportThreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/support/threads")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const rows = (json?.threads ?? []) as SupportThreadRow[];
        const open = rows.filter(
          (t) => t.status !== "resolved" && t.status !== "closed"
        );
        setThreads(open);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  const openCount = threads.length;
  const highPriority = threads.filter((t) => t.priority === "high").length;

  return (
    <ComingSoonSection
      title="Support Center"
      description="Agent workflows and SLA analytics are in development. Live ticket queue is wired below; full inbox remains in Classic Admin."
      icon={MessageSquare}
      capabilities={[
        { label: "Live open ticket queue", status: "live" },
        { label: "Support inbox (Classic Admin)", status: "live" },
        { label: "Live activity feed ticket events", status: "live" },
        { label: "SLA and response-time charts", status: "planned" },
        { label: "Agent assignment workflow", status: "planned" },
      ]}
      relatedLinks={[{ href: "/admin/support", label: "Open Support Inbox" }]}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <LandingGlassCard className="p-5 sb-card-lift">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Open tickets</p>
          <p className="text-2xl font-bold text-white tabular-nums">{openCount}</p>
          <p className="text-xs text-sb-muted mt-1">From live support threads</p>
        </LandingGlassCard>
        <LandingGlassCard className="p-5 sb-card-lift">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">High priority</p>
          <p className="text-2xl font-bold text-amber-300 tabular-nums">{highPriority}</p>
          <p className="text-xs text-sb-muted mt-1">Needs fast response</p>
        </LandingGlassCard>
      </div>

      <LandingGlassCard className="p-4 sm:p-5 sb-card-lift">
        <h3 className="text-white font-semibold mb-4">Open queue</h3>
        {loading ? (
          <SkeletonKpiGrid count={3} />
        ) : threads.length === 0 ? (
          <p className="text-sm text-sb-muted text-center py-6">No open tickets — inbox clear.</p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href="/admin/support"
                className="block rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 hover:border-sb-purple/30 transition-colors sb-card-lift"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{thread.subject}</p>
                    <p className="text-xs text-sb-muted mt-0.5">{thread.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-semibold rounded-full px-2 py-0.5 border ${priorityClass(thread.priority)}`}
                    >
                      {thread.priority ?? "normal"}
                    </span>
                    <span className="text-[10px] uppercase text-sb-muted">{thread.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </LandingGlassCard>
    </ComingSoonSection>
  );
}
