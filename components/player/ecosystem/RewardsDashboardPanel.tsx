"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import PlayerTierCard from "@/components/player/ecosystem/PlayerTierCard";
import MysteryBoxModal from "@/components/player/ecosystem/MysteryBoxModal";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { useState } from "react";

export default function RewardsDashboardPanel() {
  const { data, loading, error, refresh } = useRewardsCenter();
  const [showBox, setShowBox] = useState(false);

  if (loading) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading rewards…</p>;
  }

  if (error || !data) {
    return <p className="text-center text-red-300 py-16">{error ?? "Unable to load."}</p>;
  }

  return (
    <div className="space-y-6">
      <PlayerTierCard />

      {data.unopenedMysteryBox ? (
        <LandingGlassCard className="p-5 flex flex-wrap items-center justify-between gap-4 border border-amber-500/30 wrd-panel-cube-ready">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-300">🎁 Weekly Reward Drop Ready</p>
            <p className="text-white font-semibold">Your premium reward crate is waiting</p>
          </div>
          <Button onClick={() => setShowBox(true)}>Open Drop</Button>
        </LandingGlassCard>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink
          href="/my-games/rewards/marketplace"
          icon="🛒"
          title="Reward Marketplace"
          detail="Redeem Tier Credits for entries, merch, and VIP experiences."
        />
        <QuickLink
          href="/my-games/referrals"
          icon="👥"
          title="Invite Friends"
          detail={`${data.referral.qualifiedReferrals} qualified · Code ${data.referral.referralCode}`}
        />
        <QuickLink
          href="/my-games/rewards/promotions"
          icon="🎁"
          title="Active Promotions"
          detail={`${data.promotions.filter((p) => !p.claimed).length} offers available`}
        />
      </div>

      {data.pendingRewards.length ? (
        <LandingGlassCard className="p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Pending Rewards</h3>
          <ul className="space-y-2">
            {data.pendingRewards.map((r) => (
              <li key={r.id as string} className="flex justify-between text-sm border-b border-white/5 py-2">
                <span className="text-white">{r.title as string}</span>
                <span className="text-sb-muted capitalize">{r.reward_type as string}</span>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}

      <MysteryBoxModal
        open={showBox}
        onClose={() => setShowBox(false)}
        onOpened={() => void refresh()}
      />
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href}>
      <LandingGlassCard className="p-4 h-full hover:border-sb-purple/30 transition-colors">
        <p className="text-2xl mb-2">{icon}</p>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-sb-muted mt-1">{detail}</p>
      </LandingGlassCard>
    </Link>
  );
}
