"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { CreditCard, Wallet } from "lucide-react";

interface WalletSnapshot {
  savedPayment: { label: string | null } | null;
  fastCheckoutAvailable: boolean;
}

export default function ProfileWalletSection() {
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [connect, setConnect] = useState<PlayerConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [walletRes, connectRes] = await Promise.all([
        fetch("/api/player/wallet", { cache: "no-store" }).catch(() => null),
        fetch("/api/connect/status", { cache: "no-store" }).catch(() => null),
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
        Wallet & Payouts
      </h3>

      {loading ? (
        <p className="text-sm text-sb-muted animate-pulse">Loading wallet…</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1.5">
              Automatic payouts
            </p>
            {connect?.ready ? (
              <p className="text-sm text-emerald-300">
                Stripe connected — quarter wins deposit to your linked bank account.
              </p>
            ) : (
              <p className="text-sm text-sb-muted leading-relaxed">
                Connect Stripe on My Winnings so quarter wins can deposit automatically.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-sb-muted mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Checkout card
            </p>
            {wallet?.fastCheckoutAvailable && wallet.savedPayment?.label ? (
              <p className="text-sm text-white">{wallet.savedPayment.label} on file</p>
            ) : (
              <p className="text-sm text-sb-muted leading-relaxed">
                Save a card at checkout for faster square and Pick&apos;em purchases.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button href="/my-games/winnings" variant="secondary" size="sm">
              {connect?.ready ? "Manage payouts" : "Set up payouts"}
            </Button>
            <Link
              href="/my-games/rewards/credits"
              className="inline-flex items-center text-sm text-sb-glow hover:text-white transition-colors px-2 py-1"
            >
              View credits →
            </Link>
          </div>
        </div>
      )}
    </LandingGlassCard>
  );
}
