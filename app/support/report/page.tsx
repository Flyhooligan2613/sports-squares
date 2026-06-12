"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { SUPPORT_CATEGORIES } from "@/lib/platform/core/supportCategories";
import type { SupportCategory } from "@/lib/database/services/supportMessages";

export default function ReportProblemPage() {
  const [needsAuth, setNeedsAuth] = useState<boolean | null>(null);
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportCategory>("bug");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/support/threads");
      setNeedsAuth(res.status === 401);
    }
    void checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const res = await fetch("/api/support/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, category, message: body }),
    });

    const data = (await res.json()) as { error?: string };
    setSending(false);

    if (res.status === 401) {
      setNeedsAuth(true);
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Could not submit report.");
      return;
    }

    setSent(true);
  }

  if (needsAuth === null) {
    return (
      <PageShell title="Report a Problem" maxWidth="lg">
        <p className="text-sb-muted text-sm text-center">Loading…</p>
      </PageShell>
    );
  }

  if (needsAuth) {
    return (
      <PageShell title="Report a Problem" maxWidth="lg">
        <LandingGlassCard glow className="p-8 text-center">
          <p className="text-white font-semibold mb-2">Sign in to submit a report</p>
          <p className="text-sb-muted text-sm mb-6">
            Support tickets connect to the platform administrator. Sign in to track your conversation.
          </p>
          <Button href="/my-games/login">Sign In</Button>
        </LandingGlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Report a Problem" maxWidth="lg">
      {sent ? (
        <LandingGlassCard glow className="p-8 text-center">
          <p className="text-white font-semibold mb-2">Report received</p>
          <p className="text-sb-muted text-sm mb-4">
            Our platform administrator will review your ticket. Track replies in Message Center.
          </p>
          <Button href="/support/messages">Open Message Center</Button>
        </LandingGlassCard>
      ) : (
        <LandingGlassCard className="p-6 space-y-4">
          <p className="text-sb-muted text-sm">
            Describe what went wrong. For ongoing conversations, use{" "}
            <Link href="/support/messages" className="text-sb-glow hover:underline">
              Message Center
            </Link>
            .
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              required
              className="player-input w-full"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="player-input w-full"
            >
              {SUPPORT_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
              className="player-input w-full resize-none"
              placeholder="What happened?"
            />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <Button type="submit" disabled={sending}>
              {sending ? "Submitting…" : "Submit Report"}
            </Button>
          </form>
        </LandingGlassCard>
      )}
    </PageShell>
  );
}
