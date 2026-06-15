"use client";

import Link from "next/link";
import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

const CLAIMABLE_TYPES = new Set([
  "reward_token",
  "coupon",
  "giveaway_ticket",
  "survivor_shield",
  "mystery_box",
]);

export default function GiftShopPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading Gift Shop…</p>;
  }

  const claimableInventory = data.inventory.items.filter(
    (item) => CLAIMABLE_TYPES.has(item.itemType) && item.status === "active"
  );
  const unclaimedPromos = data.promotions.filter((p) => !p.claimed);

  async function claimPending(rewardId: string, title: string) {
    setBusyId(rewardId);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/ecosystem/pending-rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rewardId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "Could not claim reward.");
      return;
    }
    setMessage(`Claimed: ${title}`);
    await refresh({ background: true });
  }

  async function claimPromo(promotionId: string, title: string) {
    setBusyId(promotionId);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/ecosystem/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ promotionId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "Could not claim offer.");
      return;
    }
    setMessage(`Claimed: ${title}`);
    await refresh({ background: true });
  }

  return (
    <div className="space-y-8">
      <LandingGlassCard className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-pink-300 mb-2">🎀 Gift Shop</p>
          <h2 className="text-xl font-bold text-white mb-2">Claim your rewards</h2>
          <p className="text-sm text-sb-muted max-w-2xl">
            Everything you&apos;ve earned lives here — pending drops, promotions, and bonus items
            waiting to be claimed into your inventory or wallet.
          </p>
        </div>
      </LandingGlassCard>

      {message ? <p className="text-sm text-green-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Ready to claim</h3>
        {data.pendingRewards.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.pendingRewards.map((reward) => (
              <LandingGlassCard key={reward.id as string} className="p-5 flex flex-col gap-3 border-pink-500/20">
                <div>
                  <p className="text-xs uppercase tracking-wider text-pink-300">Pending reward</p>
                  <p className="text-white font-semibold mt-1">{reward.title as string}</p>
                  <p className="text-xs text-sb-muted mt-1 capitalize">
                    {(reward.reward_type as string).replace(/_/g, " ")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-auto player-btn-glow"
                  disabled={busyId === (reward.id as string)}
                  onClick={() => void claimPending(reward.id as string, reward.title as string)}
                >
                  Claim reward
                </Button>
              </LandingGlassCard>
            ))}
          </div>
        ) : (
          <LandingGlassCard className="p-6 text-center text-sb-muted text-sm">
            No pending rewards right now. Open your Square Drop or complete missions to earn more.
          </LandingGlassCard>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Promotions & gifts</h3>
        {unclaimedPromos.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {unclaimedPromos.map((promo) => (
              <LandingGlassCard key={promo.id} className="p-5 flex flex-col gap-3 border-purple-500/20">
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-300">
                    {promo.promoType.replace(/_/g, " ")}
                  </p>
                  <p className="text-white font-semibold mt-1">{promo.title}</p>
                  <p className="text-sm text-sb-muted mt-2">{promo.description}</p>
                </div>
                <Button
                  size="sm"
                  disabled={busyId === promo.id}
                  onClick={() => void claimPromo(promo.id, promo.title)}
                >
                  Claim offer
                </Button>
              </LandingGlassCard>
            ))}
          </div>
        ) : (
          <LandingGlassCard className="p-6 text-center text-sb-muted text-sm">
            No active promotions to claim. Check back for weekend bonuses and VIP events.
          </LandingGlassCard>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-white">Your bonus items</h3>
          <Link href="/my-games/rewards/inventory" className="text-xs text-sb-glow hover:underline">
            Full inventory →
          </Link>
        </div>
        {claimableInventory.length ? (
          <ul className="space-y-2">
            {claimableInventory.map((item) => (
              <li key={item.id}>
                <LandingGlassCard className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-xs text-sb-muted capitalize">
                      {item.itemType.replace(/_/g, " ")}
                      {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                    </p>
                  </div>
                  <UseItemLink itemType={item.itemType} />
                </LandingGlassCard>
              </li>
            ))}
          </ul>
        ) : (
          <LandingGlassCard className="p-6 text-center text-sb-muted text-sm">
            Claim rewards above or visit the{" "}
            <Link href="/my-games/rewards/credit-shop" className="text-sb-glow hover:underline">
              Credit Shop
            </Link>{" "}
            to buy squares, Pick&apos;em lines, and Survivor shields.
          </LandingGlassCard>
        )}
      </section>
    </div>
  );
}

function UseItemLink({ itemType }: { itemType: string }) {
  if (itemType === "survivor_shield") {
    return (
      <Button href="/survivor/private" size="sm" variant="secondary">
        Use in Survivor X
      </Button>
    );
  }
  if (itemType === "reward_token" || itemType === "square_credit") {
    return (
      <Button href="/games/nfl" size="sm" variant="secondary">
        Browse boards
      </Button>
    );
  }
  if (itemType === "pickem_entry") {
    return (
      <Button href="/pickem/week" size="sm" variant="secondary">
        Enter Pick&apos;em
      </Button>
    );
  }
  return (
    <Button href="/my-games/rewards/inventory" size="sm" variant="secondary">
      View item
    </Button>
  );
}
