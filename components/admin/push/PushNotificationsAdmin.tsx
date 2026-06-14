"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bell, Send, Zap } from "lucide-react";

interface PushLogRow {
  id: string;
  title: string;
  body: string;
  destination_url: string;
  source: string;
  subscriber_count: number;
  success_count: number;
  failed_count: number;
  created_at: string;
}

interface PushAdminState {
  configured: boolean;
  subscriberCount: number;
  settings: { dailyEnabled: boolean; dailyHourEt: number } | null;
  log: PushLogRow[];
}

export default function PushNotificationsAdmin() {
  const [state, setState] = useState<PushAdminState | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/my-games");
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyHourEt, setDailyHourEt] = useState(9);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/push", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load push admin.");
      const json = (await res.json()) as PushAdminState;
      setState(json);
      if (json.settings) {
        setDailyEnabled(json.settings.dailyEnabled);
        setDailyHourEt(json.settings.dailyHourEt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(payload: Record<string, unknown>) {
    setBusy(String(payload.action ?? "send"));
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string; result?: Record<string, unknown> };
      if (!res.ok) throw new Error(json.error ?? "Request failed.");
      if (payload.action === "send") {
        setMessage(
          `Sent to ${json.result?.successCount ?? 0} of ${json.result?.subscriberCount ?? 0} devices.`
        );
        setTitle("");
        setBody("");
      } else if (payload.action === "run_daily") {
        const result = json.result as { skipped?: boolean; reason?: string; successCount?: number; subscriberCount?: number };
        setMessage(
          result?.skipped
            ? `Daily digest skipped: ${result.reason ?? "unknown"}`
            : `Daily digest sent to ${result?.successCount ?? 0} of ${result?.subscriberCount ?? 0} devices.`
        );
      } else {
        setMessage("Settings saved.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-sb-glow" />
          Push Notifications
        </h1>
        <p className="text-sm text-sb-muted mt-2 max-w-2xl">
          ESPN-style alerts on player phones when they install SquareBoards and enable
          notifications. Uses Web Push through the PWA — works on iPhone (Add to Home Screen)
          and Android.
        </p>
      </div>

      {loading ? (
        <LandingGlassCard className="p-6 text-sb-muted">Loading…</LandingGlassCard>
      ) : (
        <>
          <LandingGlassCard className="p-6">
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs uppercase text-sb-muted">Status</p>
                <p className={`text-lg font-semibold ${state?.configured ? "text-emerald-300" : "text-amber-300"}`}>
                  {state?.configured ? "Configured" : "VAPID keys needed"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-sb-muted">Subscribers</p>
                <p className="text-lg font-semibold text-white">{state?.subscriberCount ?? 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-sb-muted">Daily automation</p>
                <p className="text-lg font-semibold text-white">
                  {dailyEnabled ? `${dailyHourEt}:00 ET` : "Off"}
                </p>
              </div>
            </div>
            {!state?.configured ? (
              <p className="text-sm text-amber-200/90">
                Add VAPID keys to Vercel, then run{" "}
                <code className="text-xs bg-white/5 px-1 py-0.5 rounded">npm run push:generate-vapid</code>{" "}
                locally to generate them.
              </p>
            ) : null}
          </LandingGlassCard>

          <LandingGlassCard className="p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send now
            </h2>
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Push title" />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message body"
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link (e.g. /pickem/week)" aria-label="Destination URL" />
              <Button
                disabled={!state?.configured || busy !== null || !title.trim() || !body.trim()}
                onClick={() => void postAction({ action: "send", title, body, url })}
              >
                {busy === "send" ? "Sending…" : "Send push to all subscribers"}
              </Button>
            </div>
          </LandingGlassCard>

          <LandingGlassCard className="p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Daily automation
            </h2>
            <p className="text-sm text-sb-muted mb-4">
              Automatically sends one push per day using the same NFL calendar engine as
              Announcements (week open, TNF, Sunday gameday, tiebreaker, holidays).
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={dailyEnabled}
                  onChange={(e) => setDailyEnabled(e.target.checked)}
                />
                Daily digest enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                Hour (ET)
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={dailyHourEt}
                  onChange={(e) => setDailyHourEt(Number(e.target.value))}
                  className="w-16 rounded-lg bg-white/5 border border-white/10 px-2 py-1"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                disabled={busy !== null}
                onClick={() =>
                  void postAction({
                    action: "update_settings",
                    dailyEnabled,
                    dailyHourEt,
                  })
                }
              >
                Save automation settings
              </Button>
              <Button
                disabled={!state?.configured || busy !== null}
                onClick={() => void postAction({ action: "run_daily" })}
              >
                {busy === "run_daily" ? "Running…" : "Run daily digest now"}
              </Button>
            </div>
          </LandingGlassCard>

          <LandingGlassCard className="p-6">
            <h2 className="text-white font-semibold mb-4">Recent deliveries</h2>
            {(state?.log ?? []).length === 0 ? (
              <p className="text-sm text-sb-muted">No pushes sent yet.</p>
            ) : (
              <div className="space-y-2">
                {state?.log.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="text-white font-medium">{row.title}</p>
                      <p className="text-xs text-sb-muted">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-sb-muted mt-1">{row.body}</p>
                    <p className="text-xs text-sb-muted mt-2">
                      {row.source} · {row.success_count}/{row.subscriber_count} delivered
                      {row.failed_count > 0 ? ` · ${row.failed_count} failed` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </LandingGlassCard>
        </>
      )}

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
