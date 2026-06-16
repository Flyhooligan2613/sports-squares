"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { OnboardingQueueConfigRow } from "@/lib/platform/engines/onboardingQueue";

export default function AdminOnboardingQueueClient() {
  const [config, setConfig] = useState<OnboardingQueueConfigRow[]>([]);
  const [debugEmail, setDebugEmail] = useState("");
  const [debugOutput, setDebugOutput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/onboarding-queue/config");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load config.");
      setConfig(json.config ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleModule(moduleId: string, enabled: boolean) {
    await fetch("/api/admin/onboarding-queue/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, enabled: !enabled }),
    });
    void load();
  }

  async function toggleTesting(moduleId: string, testingMode: boolean) {
    await fetch("/api/admin/onboarding-queue/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, testingMode: !testingMode }),
    });
    void load();
  }

  async function runDebugAction(action: "reset" | "replay" | "view") {
    if (!debugEmail.trim()) {
      setError("Enter a competitor email for debug actions.");
      return;
    }
    setError(null);
    if (action === "view") {
      const res = await fetch(
        `/api/admin/onboarding-queue/debug?email=${encodeURIComponent(debugEmail.trim())}`
      );
      const json = await res.json();
      setDebugOutput(JSON.stringify(json, null, 2));
      return;
    }
    const res = await fetch(`/api/admin/onboarding-queue/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: debugEmail.trim() }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? `${action} failed.`);
      return;
    }
    setDebugOutput(JSON.stringify(json, null, 2));
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="OnboardingQueue™"
        subtitle="Configure module order, enable/disable steps, and debug competitor onboarding."
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Module Configuration</h3>
        {loading ? (
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ) : (
          <div className="space-y-2">
            {config.map((row) => (
              <div
                key={row.moduleId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{row.moduleId}</p>
                  <p className="text-xs text-sb-muted">
                    Order {row.orderOverride ?? "—"} · Delay {row.delayMs}ms
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void toggleTesting(row.moduleId, row.testingMode)}
                  >
                    {row.testingMode ? "Testing On" : "Testing Off"}
                  </Button>
                  <Button
                    variant={row.enabled ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => void toggleModule(row.moduleId, row.enabled)}
                  >
                    {row.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </LandingGlassCard>

      <LandingGlassCard className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Debug Tools</h3>
        <p className="text-sm text-sb-muted">
          Set <code className="text-xs">ONBOARDING_QUEUE_DEBUG=true</code> or enable testing mode on
          a module for verbose queue inspection.
        </p>
        <input
          type="email"
          value={debugEmail}
          onChange={(e) => setDebugEmail(e.target.value)}
          placeholder="competitor@email.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void runDebugAction("view")}>
            View Queue
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void runDebugAction("replay")}>
            Replay Onboarding
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void runDebugAction("reset")}>
            Reset State
          </Button>
        </div>
        {debugOutput ? (
          <pre className="max-h-80 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-sb-muted">
            {debugOutput}
          </pre>
        ) : null}
      </LandingGlassCard>
    </div>
  );
}
