"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SquareWalletBalances } from "@/lib/platform/engines/payment/wallet";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface WalletCreditBreakdownProps {
  balances: SquareWalletBalances;
  withdrawableCents: number;
}

const PRIMARY_CARDS = [
  { key: "available" as const, label: "Available", accent: "text-emerald-300" },
  { key: "pendingWinnings" as const, label: "Pending Winnings", accent: "text-sb-gold" },
  { key: "pendingWithdrawals" as const, label: "Pending Withdrawals", accent: "text-amber-200" },
  { key: "withdrawable" as const, label: "Withdrawable", accent: "text-white" },
];

const CREDIT_CARDS: Array<{
  key: keyof SquareWalletBalances;
  label: string;
  accent: string;
}> = [
  { key: "contestCredits", label: "Contest Credits", accent: "text-purple-200" },
  { key: "bonusCredits", label: "Bonus Credits", accent: "text-sky-200" },
  { key: "rewardCredits", label: "Reward Credits", accent: "text-pink-200" },
  { key: "promotional", label: "Promotional", accent: "text-orange-200" },
  { key: "referral", label: "Referral", accent: "text-teal-200" },
];

export default function WalletCreditBreakdown({
  balances,
  withdrawableCents,
}: WalletCreditBreakdownProps) {
  const values: Record<string, number> = {
    available: balances.available,
    pendingWinnings: balances.pendingWinnings,
    pendingWithdrawals: balances.pendingWithdrawals,
    withdrawable: withdrawableCents,
    contestCredits: balances.contestCredits,
    bonusCredits: balances.bonusCredits,
    rewardCredits: balances.rewardCredits,
    promotional: balances.promotional,
    referral: balances.referral,
  };

  const activeCredits = CREDIT_CARDS.filter((card) => (values[card.key] ?? 0) > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PRIMARY_CARDS.map((card) => (
          <LandingGlassCard key={card.key} className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">{card.label}</p>
            <p className={`text-xl font-bold tabular-nums ${card.accent}`}>
              {formatCents(values[card.key] ?? 0)}
            </p>
          </LandingGlassCard>
        ))}
      </div>

      {activeCredits.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">
            Credit balances
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {activeCredits.map((card) => (
              <LandingGlassCard key={card.key} className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-0.5">
                  {card.label}
                </p>
                <p className={`text-base font-semibold tabular-nums ${card.accent}`}>
                  {formatCents(values[card.key] ?? 0)}
                </p>
              </LandingGlassCard>
            ))}
          </div>
        </div>
      ) : (
        <LandingGlassCard className="p-4">
          <p className="text-sm text-sb-muted text-center">
            No bonus or promotional credits right now — wins and rewards will appear here.
          </p>
        </LandingGlassCard>
      )}
    </div>
  );
}
