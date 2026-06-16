"use client";

import { useEffect, useRef, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import FastPurchaseConfirmModal from "@/components/player/FastPurchaseConfirmModal";
import { Button } from "@/components/ui/Button";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";

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
  const [email, setEmail] = useState<string | null>(null);
  const [showStepUp, setShowStepUp] = useState(false);
  const [productionMisconfigured, setProductionMisconfigured] = useState(false);
  const autostartedRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, bootstrap] = await Promise.all([
          fetch("/api/connect/status", { cache: "no-store" }),
          fetchAuthBootstrap(),
        ]);

        if (bootstrap.email) setEmail(bootstrap.email);

        if (statusRes.ok) {
          const json = (await statusRes.json()) as PlayerConnectStatus & {
            productionMisconfigured?: boolean;
          };
          setStatus({
            accountId: json.accountId,
            detailsSubmitted: json.detailsSubmitted,
            payoutsEnabled: json.payoutsEnabled,
            ready: json.ready,
          });
          if (json.productionMisconfigured) setProductionMisconfigured(true);
        }
      } catch {
        // Keep last known status.
      } finally {
        setLoading(false);
      }
    }

    if (!initialStatus) void load();
    else {
      void fetchAuthBootstrap().then((data) => {
        if (data.email) setEmail(data.email);
      });
    }
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

  useEffect(() => {
    if (loading || autostartedRef.current || status?.ready) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") !== "cashout" || params.get("autostart") !== "1") return;

    autostartedRef.current = true;
    params.delete("autostart");
    const next = params.toString();
    window.history.replaceState(
      {},
      "",
      next ? `${window.location.pathname}?${next}` : window.location.pathname
    );

    const timer = window.setTimeout(() => {
      void startOnboarding();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [loading, status?.ready]);

  async function openStripeOnboarding(stepUpToken?: string) {
    const headers: Record<string, string> = {};
    if (stepUpToken) headers["x-step-up-token"] = stepUpToken;

    const res = await fetch("/api/connect/onboard", {
      method: "POST",
      headers,
    });
    const json = (await res.json()) as {
      url?: string;
      error?: string;
      requiresStepUp?: boolean;
    };

    if (res.status === 403 && json.requiresStepUp) {
      setShowStepUp(true);
      setStarting(false);
      return;
    }

    if (!res.ok || !json.url) {
      throw new Error(json.error ?? "Could not start payout setup.");
    }

    window.location.href = json.url;
  }

  async function startOnboarding() {
    setStarting(true);
    setError(null);

    try {
      await openStripeOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payout setup.");
      setStarting(false);
    }
  }

  async function handleStepUpConfirmed(stepUpToken: string) {
    setShowStepUp(false);
    setStarting(true);
    setError(null);

    try {
      await openStripeOnboarding(stepUpToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payout setup.");
      setStarting(false);
    }
  }

  if (!connectEnabled) return null;
  if (loading) return null;
  if (status?.ready && !showWhenReady) return null;

  const payoutBlocked = productionMisconfigured;

  return (
    <>
      <LandingGlassCard glow className="p-6 sm:p-7 mb-6">
        {payoutBlocked && (
          <div
            className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95 leading-relaxed"
            role="alert"
          >
            Cash-out setup is temporarily unavailable. The platform is running in Stripe test mode,
            which only shows fake test banks — not real institutions like Chase or Wells Fargo.
            Please contact{" "}
            <a href="mailto:support@squareboards.pro" className="underline font-medium">
              support@squareboards.pro
            </a>{" "}
            if you need help.
          </div>
        )}
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
                ? "Winnings deposit automatically via SquareWallet™. Card linking and identity checks are handled securely."
                : "Required before you can place squares or picks. Tap below — a secure window opens to verify identity and link your bank. Use the same name and address from sign-up."}
            </p>
            <p className="text-xs text-emerald-300/85 mt-3 leading-relaxed max-w-xl">
              {TRUST_MESSAGES.cashOutDebitTip}
            </p>
            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          </div>

          {!status?.ready && (
            <Button
              onClick={() => void startOnboarding()}
              disabled={starting || payoutBlocked}
              className="shrink-0"
            >
              {starting ? "Opening secure setup…" : "Set up cash-out"}
            </Button>
          )}

          {status?.ready && (
            <Button
              variant="secondary"
              onClick={() => void startOnboarding()}
              disabled={starting || payoutBlocked}
              className="shrink-0"
            >
              {starting ? "Opening secure setup…" : "Update payout details"}
            </Button>
          )}
        </div>
      </LandingGlassCard>

      {email ? (
        <FastPurchaseConfirmModal
          open={showStepUp}
          email={email}
          purpose="payout_change"
          title="Confirm it's you"
          subtitle="Verify with biometrics or Quick PIN before changing payout details."
          kicker="Security check"
          pinTitle="Confirm payout change"
          pinSubtitle="Enter your Quick PIN to continue to cash-out setup"
          onClose={() => {
            setShowStepUp(false);
            setStarting(false);
          }}
          onConfirmed={handleStepUpConfirmed}
        />
      ) : null}
    </>
  );
}
