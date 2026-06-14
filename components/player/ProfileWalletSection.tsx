"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { CreditCard, Wallet } from "lucide-react";

interface WalletSnapshot {
  savedPayment: { label: string | null } | null;
  fastCheckoutAvailable: boolean;
}

interface PlayEligibilitySnapshot {
  eligible: boolean;
  payoutsReady: boolean;
  depositCardOnFile: boolean;
}

export default function ProfileWalletSection() {
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [connect, setConnect] = useState<PlayerConnectStatus | null>(null);
  const [eligibility, setEligibility] = useState<PlayEligibilitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [walletRes, connectRes, eligibilityRes] = await Promise.all([
        fetch("/api/player/wallet", { cache: "no-store" }).catch(() => null),
        fetch("/api/connect/status", { cache: "no-store" }).catch(() => null),
        fetch("/api/player/play-eligibility", { cache: "no-store" }).catch(() => null),
      ]);

      if (cancelled) return;

      if (walletRes?.ok) {
        setWallet((await walletRes.json()) as WalletSnapshot);
      }

      if (connectRes?.ok) {
        const json = (await connectRes.json()) as PlayerConnectStatus;
        setConnect({
          accountId: json.accountId,
          detailsSubmitted: json.detailsSubmitted,
          payoutsEnabled: json.payoutsEnabled,
          ready: json.ready,
        });
      }

      if (eligibilityRes?.ok) {
        const json = (await eligibilityRes.json()) as PlayEligibilitySnapshot;
        setEligibility(json);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LandingGlassCard id="wallet" className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2 flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Cash-out & Deposits
      </h3>

      {loading ? (
        <p className="text-sm text-sb-muted animate-pulse">Loading…</p>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-sb-muted leading-relaxed">
            SquareBoards does not hold player balances. Connect a Stripe cash-out account before
            playing — Stripe handles card linking, identity verification, and fraud prevention.
          </p>

          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1.5">
              Cash-out account {eligibility?.payoutsReady ? "· connected" : "· required to play"}
            </p>
            {connect?.ready ? (
              <p className="text-sm text-emerald-300">
                Stripe connected — winnings deposit automatically to your linked account.
              </p>
            ) : (
              <p className="text-sm text-amber-200/90 leading-relaxed">
                Required before you can purchase squares or enter Pick&apos;em.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Deposit card
            </p>
            {wallet?.fastCheckoutAvailable && wallet.savedPayment?.label ? (
              <p className="text-sm text-white">{wallet.savedPayment.label} on file</p>
            ) : (
              <p className="text-sm text-sb-muted leading-relaxed">
                Saved automatically at checkout. Stripe verifies your card when you pay.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button href="/my-games/winnings" variant="secondary" size="sm">
              {connect?.ready ? "Manage cash-out" : "Set up cash-out"}
            </Button>
          </div>
        </div>
      )}
    </LandingGlassCard>
  );
}
