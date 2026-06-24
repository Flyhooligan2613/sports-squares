"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import ComingSoonSection from "@/components/admin/commandCenter/ComingSoonSection";

export default function SupportCenterStub() {
  const [openTickets, setOpenTickets] = useState<number | null>(null);

  useEffect(() => {
    void fetch("/api/admin/support/threads")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const threads = (json?.threads ?? []) as { status?: string }[];
        const open = threads.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
        setOpenTickets(open);
      })
      .catch(() => setOpenTickets(null));
  }, []);

  return (
    <ComingSoonSection
      title="Support Center"
      description="Agent workflows and SLA analytics are in development. Live ticket volume is surfaced below; full inbox remains in Classic Admin."
      icon={MessageSquare}
      capabilities={[
        { label: "Support inbox (Classic Admin)", status: "live" },
        { label: "Live activity feed ticket events", status: "live" },
        { label: "SLA and response-time charts", status: "planned" },
        { label: "Agent assignment workflow", status: "planned" },
        { label: "Support volume trend analytics", status: "planned" },
      ]}
      relatedLinks={[{ href: "/admin/support", label: "Open Support Inbox" }]}
    >
      {openTickets !== null ? (
        <LandingGlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">Open tickets</p>
          <p className="text-2xl font-bold text-white tabular-nums">{openTickets}</p>
          <p className="text-xs text-sb-muted mt-1">Pulled from live support threads</p>
        </LandingGlassCard>
      ) : null}
    </ComingSoonSection>
  );
}
