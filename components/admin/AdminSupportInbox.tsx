"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { getSupportCategory } from "@/lib/platform/core/supportCategories";
import type { SupportMessage, SupportThread } from "@/lib/database/services/supportMessages";

export default function AdminSupportInbox() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadThreads() {
    setLoading(true);
    const res = await fetch("/api/admin/support/threads");
    const data = (await res.json()) as { threads?: SupportThread[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load tickets.");
      setLoading(false);
      return;
    }
    setThreads(data.threads ?? []);
    setLoading(false);
  }

  async function loadMessages(threadId: string) {
    const res = await fetch(`/api/admin/support/threads/${threadId}`);
    const data = (await res.json()) as { messages?: SupportMessage[] };
    setMessages(data.messages ?? []);
    setActiveThreadId(threadId);
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeThreadId || !reply.trim()) return;
    setSending(true);
    setError(null);

    const res = await fetch(`/api/admin/support/threads/${activeThreadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });

    const data = (await res.json()) as { error?: string };
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send reply.");
      return;
    }

    setReply("");
    await loadMessages(activeThreadId);
    await loadThreads();
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-4">
      <LandingGlassCard className="p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
          Support Tickets
        </h2>
        {loading ? (
          <p className="text-sb-muted text-sm">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="text-sb-muted text-sm">No tickets yet.</p>
        ) : (
          <ul className="space-y-2 max-h-[520px] overflow-y-auto">
            {threads.map((thread) => {
              const category = getSupportCategory(thread.category);
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => loadMessages(thread.id)}
                    className={[
                      "w-full text-left rounded-xl px-3 py-2.5 border transition-all",
                      activeThreadId === thread.id
                        ? "border-sb-purple/40 bg-sb-purple/10"
                        : "border-white/[0.06] hover:border-sb-purple/25",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-white truncate">{thread.subject}</p>
                    <p className="text-xs text-sb-muted mt-0.5">
                      {category?.label ?? thread.category} · {thread.userEmail}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </LandingGlassCard>

      <LandingGlassCard className="p-4 sm:p-5 min-h-[480px] flex flex-col">
        {activeThread ? (
          <>
            <div className="mb-4 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">{activeThread.subject}</h2>
              <p className="text-xs text-sb-muted mt-1">
                {getSupportCategory(activeThread.category)?.label ?? activeThread.category} ·{" "}
                {activeThread.userEmail}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    "rounded-xl px-3 py-2.5 max-w-[85%] text-sm",
                    message.senderType === "staff"
                      ? "ml-auto bg-emerald-500/15 border border-emerald-500/25 text-white"
                      : "mr-auto bg-white/[0.04] border border-white/[0.08] text-sb-secondary",
                  ].join(" ")}
                >
                  {message.body}
                </div>
              ))}
            </div>
            <form onSubmit={handleReply} className="space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply as platform administrator…"
                rows={3}
                className="player-input w-full resize-none"
              />
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
              <Button type="submit" disabled={sending || !reply.trim()} size="sm">
                {sending ? "Sending…" : "Send Reply"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <p className="text-white font-semibold mb-1">Platform Support Inbox</p>
            <p className="text-sb-muted text-sm">
              Select a ticket to review and respond. All support routes to the platform administrator.
            </p>
          </div>
        )}
      </LandingGlassCard>
    </div>
  );
}
