"use client";

import AliveEmptyState from "@/components/alive/AliveEmptyState";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import { REWARDS_EMPTY } from "@/lib/platform/language/rewardsLanguage";

const TYPE_LABELS: Record<string, string> = {
  square_credit: "Bonus Square Credits",
  pickem_entry: "Pick'em Entries",
  reward_token: "Reward Tokens",
  mystery_box: "Mystery Boxes",
  coupon: "Coupons",
  tier_reward: "Tier Rewards",
  merch_coupon: "Merch Coupons",
  giveaway_ticket: "Giveaway Tickets",
  cosmetic: "Exclusive Cosmetics",
  badge: "Badges",
  referral_bonus: "Referral Bonuses",
  promo_credit: "Promotional Credits",
  survivor_shield: "Survivor X Shields",
};

export default function InventoryPanel() {
  const { data, loading } = useRewardsCenter();

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading inventory…</p>;
  }

  const { items, counts, totalItems } = data.inventory;

  if (!items.length) {
    return (
      <AliveEmptyState
        context="no_rewards"
        title={REWARDS_EMPTY.noInventoryTitle}
        body={REWARDS_EMPTY.noInventoryBody}
        emoji="🏆"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(counts).map(([type, qty]) => (
          <LandingGlassCard key={type} className="p-3 text-center sb-card-lift min-h-[72px]">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted">
              {TYPE_LABELS[type] ?? type}
            </p>
            <p className="text-xl font-bold text-white tabular-nums">{qty}</p>
          </LandingGlassCard>
        ))}
      </div>

      <LandingGlassCard className="p-5 sb-card-lift">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">My Trophies & Items</h3>
          <span className="text-xs text-sb-muted">{totalItems} total</span>
        </div>
        <ul className="space-y-2" role="list">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-2 text-sm border-b border-white/5 py-3 min-h-[44px] items-center"
            >
              <span className="text-white font-medium">
                {item.title}
                {item.quantity > 1 ? ` ×${item.quantity}` : ""}
              </span>
              <span className="text-sb-muted text-xs">
                {TYPE_LABELS[item.itemType] ?? item.itemType}
                {item.valueCents ? ` · $${(item.valueCents / 100).toFixed(2)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </LandingGlassCard>
    </div>
  );
}
