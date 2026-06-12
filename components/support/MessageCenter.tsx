"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { SUPPORT_CATEGORIES } from "@/lib/platform/core/supportCategories";
import type { SupportMessage, SupportThread } from "@/lib/database/services/supportMessages";

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  general: "feedback",
  game: "gameplay",
};

export default function MessageCenter() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0].id);
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function loadThreads() {
    setLoading(true);
    const res = await fetch("/api/support/threads");
    if (res.status === 401) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { threads?: SupportThread[]; error?: string };
    setThreads(data.threads ?? []);
    setLoading(false);
  }

  async function loadMessages(threadId: string) {
    const res = await fetch(`/api/support/threads/${threadId}`);
    const data = (await res.json()) as { messages?: SupportMessage[] };
    setMessages(data.messages ?? []);
    setActiveThreadId(threadId);
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const res = await fetch("/api/support/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, category, message: body }),
    });

    const data = (await res.json()) as { threadId?: string; error?: string };
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send message.");
      return;
    }

    setComposeOpen(false);
    setSubject("");
    setBody("");
    await loadThreads();
    if (data.threadId) await loadMessages(data.threadId);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeThreadId || !reply.trim()) return;
    setSending(true);
    setError(null);

    const res = await fetch(`/api/support/threads/${activeThreadId}`, {
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

  if (needsAuth) {
    return (
      <LandingGlassCard glow className="p-8 text-center">
        <p className="text-white font-semibold mb-2">Sign in to use Message Center</p>
        <p className="text-sb-muted text-sm mb-6">
          Track support conversations, payment issues, and game questions in one place.
        </p>
        <Button href="/my-games/login">Sign In</Button>
      </LandingGlassCard>
    );
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <LandingGlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            Conversations
          </h2>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="text-xs font-semibold text-sb-glow hover:text-white"
          >
            + New
          </button>
        </div>

        {loading ? (
          <p className="text-sb-muted text-sm">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="text-sb-muted text-sm">No messages yet. Start a conversation.</p>
        ) : (
          <ul className="space-y-2">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => loadMessages(thread.id)}
                  className={[
                    "w-full text-left rounded-xl px-3 py-2.5 border transition-all",
                    activeThreadId === thread.id
                      ? "border-sb-purple/40 bg-sb-purple/10"
                      : "border-white/[0.06] hover:border-sb-purple/25 hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-white truncate">{thread.subject}</p>
                  <p className="text-xs text-sb-muted capitalize mt-0.5">
                    {SUPPORT_CATEGORIES.find((c) => c.id === (LEGACY_CATEGORY_MAP[thread.category] ?? thread.category))?.label ?? thread.category}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </LandingGlassCard>

      <LandingGlassCard className="p-4 sm:p-5 min-h-[420px] flex flex-col">
        {composeOpen ? (
          <form onSubmit={handleCreateThread} className="space-y-4">
            <h2 className="text-lg font-bold text-white">New message</h2>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              required
              className="player-input w-full"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              placeholder="Describe your issue or question…"
              required
              rows={6}
              className="player-input w-full resize-none"
            />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Message"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : activeThreadId ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    "rounded-xl px-3 py-2.5 max-w-[85%] text-sm",
                    message.senderType === "player"
                      ? "ml-auto bg-sb-purple/20 border border-sb-purple/30 text-white"
                      : "mr-auto bg-white/[0.04] border border-white/[0.08] text-sb-secondary",
                  ].join(" ")}
                >
                  {message.body}
                </div>
              ))}
            </div>
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply…"
                className="player-input flex-1"
              />
              <Button type="submit" disabled={sending || !reply.trim()} size="sm">
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <p className="text-3xl mb-3">📨</p>
            <p className="text-white font-semibold mb-1">Message Center</p>
            <p className="text-sb-muted text-sm mb-4">
              Report payment issues, ask game questions, and get replies from the platform administrator.
            </p>
            <Button onClick={() => setComposeOpen(true)}>Start a Conversation</Button>
          </div>
        )}
      </LandingGlassCard>
    </div>
  );
}
