"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AnimatedCurrency from "@/components/ui/AnimatedCurrency";
import type { SquareWalletBalances } from "@/lib/platform/engines/payment/wallet";

interface WalletCreditBreakdownProps {
  balances: SquareWalletBalances;
  withdrawableCents: number;
  lastUpdated?: string;
}

function formatLastUpdated(iso?: string): string {
  if (!iso) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function WalletCreditBreakdown({
  balances,
  withdrawableCents,
  lastUpdated,
}: WalletCreditBreakdownProps) {
  const pendingBalance = balances.pendingWinnings + balances.pendingWithdrawals;
  const bonusBalance = balances.bonusCredits;

  const secondaryCredits = [
    { label: "Contest Credits", cents: balances.contestCredits },
    { label: "Reward Credits", cents: balances.rewardCredits },
    { label: "Promotional", cents: balances.promotional },
    { label: "Referral", cents: balances.referral },
  ].filter((c) => c.cents > 0);

  return (
    <div className="space-y-4">
      <LandingGlassCard glow className="p-5 sm:p-6 sb-card-lift">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-sb-muted mb-1">Available Balance</p>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-300 tabular-nums sb-balance-increment">
              <AnimatedCurrency amount={balances.available / 100} />
            </p>
          </div>
          <p className="text-[10px] text-sb-muted/80 tabular-nums">
            Last updated {formatLastUpdated(lastUpdated)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Pending Balance</p>
            <p className="text-xl font-semibold text-sb-gold tabular-nums">{formatCents(pendingBalance)}</p>
            <p className="text-[10px] text-sb-muted/70 mt-1 leading-snug">
              Winnings & withdrawals in progress
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Bonus Balance</p>
            <p className="text-xl font-semibold text-sky-200 tabular-nums">{formatCents(bonusBalance)}</p>
            <p className="text-[10px] text-sb-muted/70 mt-1 leading-snug">Play-only · deposit match</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-1">Withdrawable</p>
            <p className="text-xl font-semibold text-white tabular-nums">{formatCents(withdrawableCents)}</p>
            <p className="text-[10px] text-sb-muted/70 mt-1 leading-snug">Ready to cash out</p>
          </div>
        </div>
      </LandingGlassCard>

      {secondaryCredits.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Other credits</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {secondaryCredits.map((card) => (
              <LandingGlassCard key={card.label} className="p-3 sb-card-lift">
                <p className="text-[10px] uppercase tracking-wider text-sb-muted mb-0.5">{card.label}</p>
                <p className="text-base font-semibold tabular-nums text-white">{formatCents(card.cents)}</p>
              </LandingGlassCard>
            ))}
          </div>
        </div>
      ) : bonusBalance === 0 && pendingBalance === 0 ? (
        <LandingGlassCard className="p-4">
          <p className="text-sm text-sb-muted text-center">
            No bonus or promotional credits right now — wins and rewards will appear here.
          </p>
        </LandingGlassCard>
      ) : null}
    </div>
  );
}
