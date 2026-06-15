"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(counts).map(([type, qty]) => (
          <LandingGlassCard key={type} className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-sb-muted">
              {TYPE_LABELS[type] ?? type}
            </p>
            <p className="text-xl font-bold text-white">{qty}</p>
          </LandingGlassCard>
        ))}
        {!Object.keys(counts).length ? (
          <LandingGlassCard className="p-3 col-span-full text-center text-sb-muted text-sm">
            Your inventory fills up as you earn rewards, open mystery boxes, and redeem promotions.
          </LandingGlassCard>
        ) : null}
      </div>

      <LandingGlassCard className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">All Items</h3>
          <span className="text-xs text-sb-muted">{totalItems} total</span>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-2 text-sm border-b border-white/5 py-2"
            >
              <span className="text-white">
                {item.title}
                {item.quantity > 1 ? ` ×${item.quantity}` : ""}
              </span>
              <span className="text-sb-muted">
                {TYPE_LABELS[item.itemType] ?? item.itemType}
                {item.valueCents ? ` · $${(item.valueCents / 100).toFixed(2)}` : ""}
              </span>
            </li>
          ))}
          {!items.length ? (
            <li className="text-sm text-sb-muted py-4 text-center">No active inventory items yet.</li>
          ) : null}
        </ul>
      </LandingGlassCard>
    </div>
  );
}
