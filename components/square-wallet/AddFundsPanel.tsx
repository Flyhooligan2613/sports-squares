"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface AddFundsPanelProps {
  suggestedCents?: number;
  returnPath?: string;
  onSuccess?: () => void;
}

const PRESETS = [2500, 5000, 10000, 25000];

export default function AddFundsPanel({
  suggestedCents,
  returnPath = "/my-games/wallet",
  onSuccess,
}: AddFundsPanelProps) {
  const [amountCents, setAmountCents] = useState(suggestedCents ?? 2500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startDeposit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/square-wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, returnPath }),
      });
      const data = (await res.json()) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start deposit.");
        return;
      }
      onSuccess?.();
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Deposit checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LandingGlassCard glow className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        Add Funds to SquareWallet™
      </h3>
      <p className="text-xs text-sb-muted mb-4 leading-relaxed">
        Fund your wallet once — join contests without re-entering card details. First deposit gets a
        100% match up to $100 in play-only bonus funds. Bonus winnings convert to withdrawable cash.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((cents) => (
          <button
            key={cents}
            type="button"
            onClick={() => setAmountCents(cents)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              amountCents === cents
                ? "border-sb-gold/50 bg-sb-gold/10 text-sb-gold"
                : "border-white/10 text-sb-muted hover:border-white/20"
            }`}
          >
            ${(cents / 100).toFixed(0)}
          </button>
        ))}
      </div>

      <label className="block text-xs text-sb-muted mb-1">Custom amount</label>
      <input
        type="number"
        min={5}
        step={1}
        value={Math.round(amountCents / 100)}
        onChange={(e) => setAmountCents(Math.max(500, Math.round(Number(e.target.value) * 100)))}
        className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
      />

      {error ? <p className="text-sm text-red-300 mb-3">{error}</p> : null}

      <Button onClick={() => void startDeposit()} disabled={loading} className="w-full">
        {loading ? "Starting checkout…" : `Deposit $${(amountCents / 100).toFixed(2)}`}
      </Button>
    </LandingGlassCard>
  );
}
