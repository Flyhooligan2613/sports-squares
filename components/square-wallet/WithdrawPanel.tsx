"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import FastPurchaseConfirmModal from "@/components/player/FastPurchaseConfirmModal";
import { Button } from "@/components/ui/Button";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";

interface WithdrawPanelProps {
  withdrawableCents: number;
  onComplete?: () => void;
}

export default function WithdrawPanel({ withdrawableCents, onComplete }: WithdrawPanelProps) {
  const [amountCents, setAmountCents] = useState(Math.min(withdrawableCents, 5000) || 1000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showStepUp, setShowStepUp] = useState(false);

  useEffect(() => {
    void fetchAuthBootstrap().then((data) => {
      if (data.email) setEmail(data.email);
    });
  }, []);

  async function submitWithdrawal(stepUpToken?: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (stepUpToken) headers["x-step-up-token"] = stepUpToken;

      const res = await fetch("/api/square-wallet/withdraw", {
        method: "POST",
        headers,
        body: JSON.stringify({ amountCents }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pendingReview?: boolean;
        error?: string;
        requiresStepUp?: boolean;
      };
      if (res.status === 403 && data.requiresStepUp) {
        setShowStepUp(true);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Withdrawal could not be processed.");
        return;
      }
      setMessage(
        data.pendingReview
          ? "Your withdrawal is under review — we'll notify you when it's sent."
          : "Withdrawal sent to your linked cash-out account."
      );
      onComplete?.();
    } catch {
      setError("Withdrawal failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStepUpConfirmed(stepUpToken: string) {
    setShowStepUp(false);
    await submitWithdrawal(stepUpToken);
  }

  return (
    <>
      {email ? (
        <FastPurchaseConfirmModal
          open={showStepUp}
          email={email}
          purpose="payout_change"
          title="Confirm withdrawal"
          subtitle="Verify with biometrics or Quick PIN before cashing out."
          kicker="SquareWallet™"
          pinTitle="Confirm withdrawal"
          pinSubtitle="Enter your Quick PIN to request this withdrawal."
          onClose={() => setShowStepUp(false)}
          onConfirmed={handleStepUpConfirmed}
        />
      ) : null}
    <LandingGlassCard className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2">
        Withdraw to Cash-out Account
      </h3>
      <p className="text-xs text-sb-muted mb-4">
        Withdrawable: ${(withdrawableCents / 100).toFixed(2)} · Sent via SquareWallet™ to your
        linked account.
      </p>

      <input
        type="number"
        min={10}
        step={1}
        value={Math.round(amountCents / 100)}
        onChange={(e) => setAmountCents(Math.round(Number(e.target.value) * 100))}
        className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
      />

      {error ? <p className="text-sm text-red-300 mb-2">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300 mb-2">{message}</p> : null}

      <Button
        variant="secondary"
        onClick={() => void submitWithdrawal()}
        disabled={loading || withdrawableCents <= 0}
        className="w-full"
      >
        {loading ? "Processing…" : "Request Withdrawal"}
      </Button>
    </LandingGlassCard>
    </>
  );
}
