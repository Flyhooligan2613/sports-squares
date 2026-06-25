"use client";

import Link from "next/link";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import PlayerTierCard from "@/components/player/ecosystem/PlayerTierCard";
import MysteryBoxModal from "@/components/player/ecosystem/MysteryBoxModal";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { SQUARE_DROP_NAME, SQUARE_DROP_READY } from "@/lib/platform/ecosystem/squareDropBrand";
import { useState } from "react";

export default function RewardsDashboardPanel() {
  const { data, loading, error, refresh } = useRewardsCenter();
  const [showBox, setShowBox] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="sb-xp-skeleton h-40 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="sb-xp-skeleton h-24 rounded-xl" />
          <div className="sb-xp-skeleton h-24 rounded-xl" />
        </div>
        <BrandedLoadingLabel context="rewardDrop" className="text-center text-sb-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <LandingGlassCard className="p-8 text-center">
        <p className="text-white font-semibold mb-2">Couldn&apos;t load rewards</p>
        <p className="text-sm text-sb-muted mb-6">{error ?? "Something went wrong."}</p>
        <Button variant="secondary" size="sm" onClick={() => void refresh()}>
          Try again
        </Button>
      </LandingGlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerTierCard />

      {data.unopenedMysteryBox ? (
        <LandingGlassCard className="p-5 flex flex-wrap items-center justify-between gap-4 border border-purple-500/30 wrd-panel-cube-ready">
          <div>
            <p className="text-xs uppercase tracking-wider text-purple-300">🎁 {SQUARE_DROP_READY}</p>
            <p className="text-white font-semibold">Your {SQUARE_DROP_NAME} is waiting</p>
          </div>
          <Button onClick={() => setShowBox(true)}>Open Drop</Button>
        </LandingGlassCard>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <QuickLink
          href="/my-games/rewards/gift-shop"
          icon="🎀"
          title="Gift Shop"
          detail="Claim pending rewards, promotions, and bonus items"
        />
        <QuickLink
          href="/my-games/rewards/credit-shop"
          icon="💎"
          title="Credit Shop"
          detail={`Spend ${data.wallet.tierCredits.toLocaleString()} Tier Credits on squares, lines & shields`}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink
          href="/my-games/rewards/square-drop"
          icon="🎁"
          title={SQUARE_DROP_NAME}
          detail="Weekly premium reward experience"
        />
        <QuickLink
          href="/my-games/referrals"
          icon="👥"
          title="Invite Friends"
          detail={`${data.referral.qualifiedReferrals} qualified · Code ${data.referral.referralCode}`}
        />
        <QuickLink
          href="/my-games/rewards/achievements"
          icon="🏆"
          title="Achievements"
          detail="100+ milestones — build your legacy"
        />
      </div>

      {data.pendingRewards.length ? (
        <LandingGlassCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-white">Ready to claim</h3>
            <Link href="/my-games/rewards/gift-shop" className="text-xs text-sb-glow hover:underline">
              Open Gift Shop →
            </Link>
          </div>
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
        onOpened={() => void refresh({ background: true })}
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
