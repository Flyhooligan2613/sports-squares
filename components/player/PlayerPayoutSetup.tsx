"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { ensurePayoutStepUp } from "@/lib/auth/security/fastConfirm";
import { getStepUpToken } from "@/lib/auth/security/deviceClient";

interface PlayerPayoutSetupProps {
  initialStatus?: PlayerConnectStatus | null;
  connectEnabled?: boolean;
  showWhenReady?: boolean;
}

export default function PlayerPayoutSetup({
  initialStatus = null,
  connectEnabled = true,
  showWhenReady = false,
}: PlayerPayoutSetupProps) {
  const [status, setStatus] = useState<PlayerConnectStatus | null>(initialStatus);
  const [loading, setLoading] = useState(!initialStatus);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/connect/status", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as PlayerConnectStatus & {
          connectEnabled?: boolean;
        };
        setStatus({
          accountId: json.accountId,
          detailsSubmitted: json.detailsSubmitted,
          payoutsEnabled: json.payoutsEnabled,
          ready: json.ready,
        });
      } catch {
        // Keep last known status.
      } finally {
        setLoading(false);
      }
    }

    if (!initialStatus) void load();
  }, [initialStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connect = params.get("connect");
    if (!connect) return;

    async function refreshAfterReturn() {
      try {
        const res = await fetch("/api/connect/refresh", { method: "POST" });
        if (!res.ok) return;
        setStatus((await res.json()) as PlayerConnectStatus);
      } catch {
        // Ignore refresh failures — status endpoint still works.
      } finally {
        params.delete("connect");
        const next = params.toString();
        const url = next
          ? `${window.location.pathname}?${next}`
          : window.location.pathname;
        window.history.replaceState({}, "", url);
      }
    }

    void refreshAfterReturn();
  }, []);

  async function startOnboarding() {
    setStarting(true);
    setError(null);

    try {
      let stepUpToken = getStepUpToken();
      if (!stepUpToken) {
        stepUpToken = await ensurePayoutStepUp();
      }

      const headers: Record<string, string> = {};
      if (stepUpToken) headers["x-step-up-token"] = stepUpToken;

      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not start payout setup.");
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payout setup.");
      setStarting(false);
    }
  }

  if (!connectEnabled) return null;
  if (loading) return null;
  if (status?.ready && !showWhenReady) return null;

  return (
    <LandingGlassCard glow className="p-6 sm:p-7 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-400/90 mb-2">
            Cash-out account
          </p>
          <h2 className="text-xl font-bold text-white mb-2">
            {status?.ready ? "Cash-out account connected" : "Set up your cash-out account"}
          </h2>
          <p className="text-sm text-sb-muted leading-relaxed max-w-xl">
            {status?.ready
              ? "Winnings deposit automatically via Stripe. Card linking and identity checks are handled by Stripe."
              : "Required before you can place squares or picks. Connect through Stripe — they verify your identity and payout details."}
          </p>
          {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        </div>

        {!status?.ready && (
          <Button onClick={() => startOnboarding()} disabled={starting} className="shrink-0">
            {starting ? "Opening Stripe…" : "Set up cash-out"}
          </Button>
        )}

        {status?.ready && (
          <Button
            variant="secondary"
            onClick={() => startOnboarding()}
            disabled={starting}
            className="shrink-0"
          >
            {starting ? "Opening Stripe…" : "Update payout details"}
          </Button>
        )}
      </div>
    </LandingGlassCard>
  );
}
