"use client";

import { useEffect, useState } from "react";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { formatTierCents } from "@/lib/platform/core/entryTiers";
import type { PickemEntryStatus } from "@/lib/pickem/types";

interface PickemEntryPanelProps {
  contestLabel: string;
  entry: PickemEntryStatus;
  loading?: boolean;
  error?: string | null;
  savedPaymentLabel?: string | null;
  onCheckout: () => void;
  onFastCheckout?: () => void;
}

export default function PickemEntryPanel({
  contestLabel,
  entry,
  loading = false,
  error,
  savedPaymentLabel,
  onCheckout,
  onFastCheckout,
}: PickemEntryPanelProps) {
  const tierLabel = formatTierCents(entry.tierCents);
  const priceLabel = formatTierCents(entry.amountCents);

  if (entry.paid) {
    return (
      <LandingGlassCard className="p-5 mb-6 border border-emerald-500/25 bg-emerald-500/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400/90 mb-1">
              Entry confirmed
            </p>
            <p className="text-white font-semibold">
              {tierLabel} tier · {contestLabel}
            </p>
            <p className="text-sb-muted text-sm mt-1">
              You&apos;re in. Make your picks before kickoff — they lock automatically.
            </p>
          </div>
          <span className="text-emerald-400 text-sm font-semibold">✓ Paid</span>
        </div>
      </LandingGlassCard>
    );
  }

  return (
    <LandingGlassCard className="p-5 sm:p-6 mb-6 border border-sb-purple/20">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-1">
            Weekly entry
          </p>
          <h2 className="text-white font-semibold text-lg">
            Enter {contestLabel} — {tierLabel}
          </h2>
          <p className="text-sb-muted text-sm mt-1 max-w-xl">
            One {priceLabel} entry unlocks all picks for this week at the {tierLabel} tier.
            Payouts process automatically through Stripe when the week completes.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{priceLabel}</p>
          <p className="text-xs text-sb-muted">per week</p>
        </div>
      </div>

      {entry.requiresAuth ? (
        <Button href="/my-games/login?next=/pickem/week">Sign in to enter</Button>
      ) : savedPaymentLabel && onFastCheckout ? (
        <div className="space-y-3">
          <Button
            onClick={onFastCheckout}
            disabled={loading}
            className="inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? "Processing…" : `Confirm with biometrics · ${priceLabel}`}
          </Button>
          <p className="text-xs text-sb-muted">Charging {savedPaymentLabel}</p>
          <Button variant="ghost" size="sm" disabled={loading} onClick={onCheckout}>
            Use different payment method
          </Button>
        </div>
      ) : (
        <Button onClick={onCheckout} disabled={loading} className="inline-flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          {loading ? "Redirecting…" : `Pay ${priceLabel} & Enter`}
        </Button>
      )}

      <p className="flex items-center gap-1.5 text-xs text-sb-muted mt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
        Secured by Stripe · Administrators cannot alter results
      </p>

      {error ? <p className="text-xs text-red-400 mt-3">{error}</p> : null}
    </LandingGlassCard>
  );
}
