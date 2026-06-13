"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

export default function PromotionsPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading promotions…</p>;
  }

  async function claim(promotionId: string) {
    setBusyId(promotionId);
    await fetch("/api/ecosystem/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ promotionId }),
    });
    setBusyId(null);
    await refresh();
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {data.promotions.map((promo) => (
        <LandingGlassCard
          key={promo.id}
          className={`p-5 flex flex-col gap-3 ${promo.claimed ? "opacity-70" : "border-sb-purple/20"}`}
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-purple-light">{promo.promoType.replace("_", " ")}</p>
            <h3 className="text-lg font-semibold text-white mt-1">{promo.title}</h3>
            <p className="text-sm text-sb-muted mt-2">{promo.description}</p>
          </div>
          <div className="text-xs text-sb-muted space-y-1 mt-auto">
            {promo.creditReward > 0 ? (
              <p>+{promo.creditReward.toLocaleString()} Tier Credits</p>
            ) : null}
            {promo.squareCreditCents > 0 ? (
              <p>+${(promo.squareCreditCents / 100).toFixed(2)} Square Credit</p>
            ) : null}
            {promo.multiplier > 1 ? <p>{promo.multiplier}x credit multiplier</p> : null}
          </div>
          <Button
            size="sm"
            variant={promo.claimed ? "secondary" : "primary"}
            disabled={promo.claimed || busyId === promo.id}
            onClick={() => void claim(promo.id)}
          >
            {promo.claimed ? "Claimed" : "Claim Offer"}
          </Button>
        </LandingGlassCard>
      ))}
      {!data.promotions.length ? (
        <LandingGlassCard className="p-8 col-span-full text-center text-sb-muted">
          No active promotions right now. Check back for Friday Bonus, holiday giveaways, and VIP weekends.
        </LandingGlassCard>
      ) : null}
    </div>
  );
}
