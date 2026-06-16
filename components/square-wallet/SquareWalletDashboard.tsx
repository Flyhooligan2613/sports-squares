"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SmartWalletRecommendation, SquareWalletDashboard } from "@/lib/platform/engines/payment/wallet";
import WalletBalanceCards from "./WalletBalanceCards";
import AddFundsPanel from "./AddFundsPanel";
import WithdrawPanel from "./WithdrawPanel";
import TransactionHistory from "./TransactionHistory";
import SmartWalletRecommendations from "./SmartWalletRecommendations";
import DepositSuccessAnimation from "./DepositSuccessAnimation";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SquareWalletDashboard() {
  const [dashboard, setDashboard] = useState<SquareWalletDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<SmartWalletRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "withdraw">("overview");
  const [suggestedDeposit, setSuggestedDeposit] = useState<number | undefined>();

  const refresh = useCallback(async () => {
    const [dashRes, recRes] = await Promise.all([
      fetch("/api/square-wallet/dashboard", { cache: "no-store" }),
      fetch("/api/square-wallet/smart-recommendations", { cache: "no-store" }),
    ]);
    if (dashRes.ok) {
      const data = (await dashRes.json()) as { dashboard: SquareWalletDashboard | null };
      setDashboard(data.dashboard);
    }
    if (recRes.ok) {
      const data = (await recRes.json()) as { recommendations: SmartWalletRecommendation[] };
      setRecommendations(data.recommendations);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deposit = params.get("deposit");
    if (deposit) setSuggestedDeposit(Math.max(500, Number(deposit)));
    if (params.get("tab") === "withdraw") setTab("withdraw");
    void refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="py-20">
        <BrandedLoadingLabel context="general" className="text-center text-sb-muted animate-pulse" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <LandingGlassCard className="p-8 text-center">
        <p className="text-sb-muted">Could not load SquareWallet™.</p>
      </LandingGlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <DepositSuccessAnimation />

      <header>
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-6 h-6 text-sb-gold" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            SquareWallet™
          </h1>
        </div>
        <p className="text-sb-muted text-sm max-w-xl">
          Your premium financial hub — fund contests, track winnings, and manage cash-out on your
          terms.
        </p>
        {dashboard.paymentMethod.fastCheckoutAvailable && dashboard.paymentMethod.last4 ? (
          <p className="text-xs text-sb-muted mt-2">
            Card on file · {dashboard.paymentMethod.brand ?? "Card"} ····{" "}
            {dashboard.paymentMethod.last4}
          </p>
        ) : null}
      </header>

      <WalletBalanceCards
        balances={dashboard.balances}
        withdrawableCents={dashboard.withdrawableCents}
      />

      <div className="grid lg:grid-cols-3 gap-3">
        <LandingGlassCard className="p-4 text-center">
          <p className="text-[10px] uppercase text-sb-muted">Lifetime Deposits</p>
          <p className="text-lg font-bold text-white tabular-nums">
            {formatCents(dashboard.lifetime.depositsCents)}
          </p>
        </LandingGlassCard>
        <LandingGlassCard className="p-4 text-center">
          <p className="text-[10px] uppercase text-sb-muted">Contest Entries</p>
          <p className="text-lg font-bold text-white tabular-nums">
            {formatCents(dashboard.lifetime.contestEntriesCents)}
          </p>
        </LandingGlassCard>
        <LandingGlassCard className="p-4 text-center">
          <p className="text-[10px] uppercase text-sb-muted">Contest Winnings</p>
          <p className="text-lg font-bold text-sb-gold tabular-nums">
            {formatCents(dashboard.lifetime.winningsCents)}
          </p>
        </LandingGlassCard>
      </div>

      <SmartWalletRecommendations recommendations={recommendations} />

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(["overview", "withdraw"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-full capitalize ${
              tab === t ? "bg-white/10 text-white" : "text-sb-muted hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <AddFundsPanel suggestedCents={suggestedDeposit} onSuccess={() => void refresh()} />
          <TransactionHistory initialEntries={dashboard.recentTransactions} />
        </div>
      ) : (
        <WithdrawPanel withdrawableCents={dashboard.withdrawableCents} onComplete={() => void refresh()} />
      )}
    </div>
  );
}
