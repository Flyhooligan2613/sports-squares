"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PlayEligibilityBlocker } from "@/lib/payments/playEligibility";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface PlayEligibilityResponse {
  eligible: boolean;
  canStartCheckout?: boolean;
  blockers: PlayEligibilityBlocker[];
  payoutsReady: boolean;
  depositCardOnFile: boolean;
  savedPaymentLabel: string | null;
  setupUrl: string;
}

function blockerMessage(blockers: PlayEligibilityBlocker[]): string {
  if (blockers.includes("sign_in_required")) {
    return "Sign in to set up your cash-out account and play.";
  }
  if (blockers.includes("payout_account_required")) {
    return "Connect your cash-out account through Stripe before placing squares or picks. SquareBoards does not hold balances — Stripe handles deposits, identity checks, and payouts.";
  }
  return "Complete cash-out setup before playing.";
}

interface PlayEligibilityBannerProps {
  className?: string;
  compact?: boolean;
}

export default function PlayEligibilityBanner({
  className = "",
  compact = false,
}: PlayEligibilityBannerProps) {
  const [status, setStatus] = useState<PlayEligibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/player/play-eligibility", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as PlayEligibilityResponse;
        if (!cancelled) setStatus(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;
  if (!status || status.eligible) {
    if (compact) return null;
    return (
      <LandingGlassCard
        className={`p-4 border border-emerald-500/25 bg-emerald-500/5 ${className}`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-200 font-medium">Ready to play</p>
            <p className="text-xs text-sb-muted mt-1">
              Cash-out connected
              {status?.savedPaymentLabel ? ` · ${status.savedPaymentLabel}` : ""}. Stripe
              verifies your card and identity — SquareBoards does not hold player balances.
            </p>
          </div>
        </div>
      </LandingGlassCard>
    );
  }

  const blockers = status.blockers ?? [];
  const setupHref =
    blockers.includes("sign_in_required") ? "/my-games/login" : status.setupUrl;

  return (
    <LandingGlassCard
      className={`p-4 sm:p-5 border border-amber-500/30 bg-amber-500/5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-200 font-semibold mb-1">
              Cash-out setup required
            </p>
            <p className="text-sm text-sb-muted leading-relaxed max-w-xl">
              {blockerMessage(blockers)}
            </p>
            {!compact ? (
              <p className="text-xs text-sb-muted mt-2">
                SquareBoards is a competition platform only. All payment verification and fraud
                prevention is handled by Stripe.
              </p>
            ) : null}
          </div>
        </div>
        <Button href={setupHref} size="sm" className="shrink-0">
          {blockers.includes("sign_in_required") ? "Sign in" : "Set up cash-out"}
        </Button>
      </div>
    </LandingGlassCard>
  );
}

export function usePlayEligible(): {
  eligible: boolean | null;
  loading: boolean;
  blockers: PlayEligibilityBlocker[];
} {
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [blockers, setBlockers] = useState<PlayEligibilityBlocker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/player/play-eligibility", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setEligible(false);
          return;
        }
        const json = (await res.json()) as PlayEligibilityResponse;
        if (!cancelled) {
          setEligible(json.eligible);
          setBlockers(json.blockers ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { eligible, loading, blockers };
}
