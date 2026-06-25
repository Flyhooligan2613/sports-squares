"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import { formatUserError } from "@/lib/errors/formatUserError";
import WalletTrustSignals from "./WalletTrustSignals";

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
        setError(formatUserError(data.error ?? "checkout failed", "deposit"));
        return;
      }
      onSuccess?.();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(formatUserError(err, "deposit"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LandingGlassCard glow className="p-4 sm:p-6 sb-card-lift">
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
            disabled={loading}
            aria-pressed={amountCents === cents}
            aria-label={`Deposit $${(cents / 100).toFixed(0)}`}
            className={[
              "px-3 py-2 min-h-[40px] rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40 sb-btn-press",
              amountCents === cents
                ? "border-sb-gold/50 bg-sb-gold/10 text-sb-gold"
                : "border-white/10 text-sb-muted hover:border-white/20",
            ].join(" ")}
          >
            ${(cents / 100).toFixed(0)}
          </button>
        ))}
      </div>

      <label htmlFor="wallet-deposit-amount" className="block text-xs text-sb-muted mb-1">
        Custom amount
      </label>
      <input
        id="wallet-deposit-amount"
        type="number"
        min={5}
        step={1}
        disabled={loading}
        value={Math.round(amountCents / 100)}
        onChange={(e) => setAmountCents(Math.max(500, Math.round(Number(e.target.value) * 100)))}
        className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 min-h-[44px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
      />

      {loading ? (
        <div className="mb-4 space-y-2" aria-busy="true">
          <div className="sb-xp-skeleton h-10 rounded-lg" />
          <BrandedLoadingLabel context="wallet" className="text-center text-sb-muted text-sm py-2" />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-200/90 mb-3" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        onClick={() => void startDeposit()}
        disabled={loading}
        className="w-full min-h-[44px] sb-btn-press"
      >
        {loading ? "Preparing secure checkout…" : `Deposit $${(amountCents / 100).toFixed(2)}`}
      </Button>

      <WalletTrustSignals className="mt-5 pt-4 border-t border-white/[0.06]" />
    </LandingGlassCard>
  );
}
