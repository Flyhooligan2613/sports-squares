"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

export default function BonusWalletPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading wallet…</p>;
  }

  const w = data.wallet;

  const rows = [
    { label: "Cash Balance", value: `$${(w.cashBalanceCents / 100).toFixed(2)}`, href: "/my-games/winnings" },
    { label: "Pending SquareWallet Payouts", value: `$${(w.pendingPayoutCents / 100).toFixed(2)}` },
    { label: "Square Credits", value: `$${(w.squareCreditsCents / 100).toFixed(2)}` },
    { label: "Pick'em Credits", value: `$${(w.pickemCreditsCents / 100).toFixed(2)}` },
    { label: "Tier Credits", value: w.tierCredits.toLocaleString() },
    { label: "Bonus Tokens", value: String(data.inventory.counts.reward_token ?? 0) },
    { label: "Mystery Boxes", value: String(w.mysteryBoxesAvailable) },
    { label: "Referral Rewards", value: `$${(w.referralEarningsCents / 100).toFixed(2)}` },
    { label: "Promotional Credits", value: String(data.inventory.counts.promo_credit ?? 0) },
    { label: "Pending Rewards", value: String(w.pendingRewards) },
  ];

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💎 Bonus Wallet</h3>
        <p className="text-sm text-sb-muted mb-6">
          Your full balance across cash winnings, game credits, tier progression, and bonus inventory.
        </p>
        <dl className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0"
            >
              <dt className="text-sm text-sb-muted">{row.label}</dt>
              <dd className="text-sm font-semibold text-white tabular-nums">
                {row.href ? (
                  <Link href={row.href} className="hover:text-sb-purple-light underline-offset-2 hover:underline">
                    {row.value}
                  </Link>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </LandingGlassCard>

      <div className="grid sm:grid-cols-3 gap-3">
        <LandingGlassCard className="p-4 text-center">
          <p className="text-xs text-sb-muted">Earned This Week</p>
          <p className="text-xl font-bold text-white">{w.weeklyTierCredits.toLocaleString()}</p>
        </LandingGlassCard>
        <LandingGlassCard className="p-4 text-center">
          <p className="text-xs text-sb-muted">Lifetime Credits</p>
          <p className="text-xl font-bold text-white">{w.lifetimeTierCredits.toLocaleString()}</p>
        </LandingGlassCard>
        <LandingGlassCard className="p-4 text-center">
          <p className="text-xs text-sb-muted">Login Streak</p>
          <p className="text-xl font-bold text-white">{data.loginStreak} days</p>
        </LandingGlassCard>
      </div>
    </div>
  );
}
