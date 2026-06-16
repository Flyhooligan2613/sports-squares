"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SquareWalletBalances } from "@/lib/platform/engines/payment/wallet";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface WalletBalanceCardsProps {
  balances: SquareWalletBalances;
  withdrawableCents: number;
}

const CARDS: Array<{
  key: keyof SquareWalletBalances | "withdrawable";
  label: string;
  accent: string;
}> = [
  { key: "available", label: "Available", accent: "text-emerald-300" },
  { key: "pendingWinnings", label: "Pending Winnings", accent: "text-sb-gold" },
  { key: "pendingWithdrawals", label: "Pending Withdrawals", accent: "text-amber-200" },
  { key: "withdrawable", label: "Withdrawable", accent: "text-white" },
];

export default function WalletBalanceCards({ balances, withdrawableCents }: WalletBalanceCardsProps) {
  const values: Record<string, number> = {
    available: balances.available,
    pendingWinnings: balances.pendingWinnings,
    pendingWithdrawals: balances.pendingWithdrawals,
    withdrawable: withdrawableCents,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map((card) => (
        <LandingGlassCard key={card.key} className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">{card.label}</p>
          <p className={`text-xl font-bold tabular-nums ${card.accent}`}>
            {formatCents(values[card.key] ?? 0)}
          </p>
        </LandingGlassCard>
      ))}
    </div>
  );
}
