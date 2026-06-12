"use client";

import { useState } from "react";
import PageShell from "@/components/ui/PageShell";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ReportProblemPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell title="Report a Problem" maxWidth="lg">
      {sent ? (
        <LandingGlassCard glow className="p-8 text-center">
          <p className="text-white font-semibold mb-2">Report received</p>
          <p className="text-sb-muted text-sm mb-4">
            For tracked conversations, use Message Center after signing in.
          </p>
          <Button href="/support/messages">Open Message Center</Button>
        </LandingGlassCard>
      ) : (
        <LandingGlassCard className="p-6 space-y-4">
          <p className="text-sb-muted text-sm">
            Describe what went wrong. For faster help with payments or boards,{" "}
            <Link href="/support/messages" className="text-sb-glow hover:underline">
              Message Center
            </Link>{" "}
            lets you track replies.
          </p>
          <textarea
            rows={5}
            className="player-input w-full resize-none"
            placeholder="What happened?"
          />
          <Button onClick={() => setSent(true)}>Submit Report</Button>
        </LandingGlassCard>
      )}
    </PageShell>
  );
}
