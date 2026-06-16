"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface WithdrawPanelProps {
  withdrawableCents: number;
  onComplete?: () => void;
}

export default function WithdrawPanel({ withdrawableCents, onComplete }: WithdrawPanelProps) {
  const [amountCents, setAmountCents] = useState(Math.min(withdrawableCents, 5000) || 1000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/square-wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pendingReview?: boolean;
        error?: string;
      };
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

  return (
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
        onClick={() => void submit()}
        disabled={loading || withdrawableCents <= 0}
        className="w-full"
      >
        {loading ? "Processing…" : "Request Withdrawal"}
      </Button>
    </LandingGlassCard>
  );
}
