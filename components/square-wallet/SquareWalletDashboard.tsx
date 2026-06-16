"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SmartWalletRecommendation, SquareWalletDashboard } from "@/lib/platform/engines/payment/wallet";
import type { WalletHistoryCategory } from "@/lib/platform/engines/payment/wallet/ledgerCategories";
import WalletCreditBreakdown from "./WalletCreditBreakdown";
import AddFundsPanel from "./AddFundsPanel";
import WithdrawPanel from "./WithdrawPanel";
import WalletPaymentMethodsPanel from "./WalletPaymentMethodsPanel";
import WalletHistoryTabs from "./WalletHistoryTabs";
import SmartWalletRecommendations from "./SmartWalletRecommendations";
import DepositSuccessAnimation from "./DepositSuccessAnimation";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type WalletTab =
  | "overview"
  | "deposit"
  | "withdraw"
  | "payment-methods"
  | "history";

const MAIN_TABS: Array<{ id: WalletTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "history", label: "History" },
];

function parseTab(value: string | null): WalletTab {
  if (
    value === "deposit" ||
    value === "withdraw" ||
    value === "payment-methods" ||
    value === "history" ||
    value === "overview"
  ) {
    return value;
  }
  return "overview";
}

function parseHistoryCategory(value: string | null): WalletHistoryCategory {
  if (
    value === "deposits" ||
    value === "withdrawals" ||
    value === "contest_bets" ||
    value === "wins" ||
    value === "losses"
  ) {
    return value;
  }
  return "deposits";
}

export default function SquareWalletDashboard() {
  const [dashboard, setDashboard] = useState<SquareWalletDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<SmartWalletRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WalletTab>("overview");
  const [historyCategory, setHistoryCategory] = useState<WalletHistoryCategory>("deposits");
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
    setTab(parseTab(params.get("tab")));
    setHistoryCategory(parseHistoryCategory(params.get("history")));
    void refresh();
  }, [refresh]);

  function selectTab(next: WalletTab) {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    window.history.replaceState({}, "", query ? `?${query}` : window.location.pathname);
  }

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
        <p className="text-sb-muted mb-2">SquareWallet™ is getting ready.</p>
        <p className="text-sm text-sb-muted">Refresh in a moment or contact support if this persists.</p>
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
      </header>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {MAIN_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectTab(item.id)}
            className={[
              "shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors",
              tab === item.id
                ? "bg-white/10 border-white/20 text-white"
                : "border-transparent text-sb-muted hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <WalletCreditBreakdown
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
        </>
      ) : null}

      {tab === "deposit" ? (
        <AddFundsPanel suggestedCents={suggestedDeposit} onSuccess={() => void refresh()} />
      ) : null}

      {tab === "withdraw" ? (
        <WithdrawPanel
          withdrawableCents={dashboard.withdrawableCents}
          onComplete={() => void refresh()}
        />
      ) : null}

      {tab === "payment-methods" ? (
        <WalletPaymentMethodsPanel paymentMethod={dashboard.paymentMethod} />
      ) : null}

      {tab === "history" ? <WalletHistoryTabs initialCategory={historyCategory} /> : null}
    </div>
  );
}
