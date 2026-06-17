"use client";

import { useMemo, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";

function extractLeadingEmoji(title: string): string | null {
  const first = title.trim().split(/\s+/)[0] ?? "";
  if (!first || /^[A-Za-z0-9$]/.test(first)) return null;
  return first;
}

const CATEGORY_LABELS: Record<string, string> = {
  premium_emojis: "Premium Profile Emojis",
  game_items: "Game Items — Squares, Lines & Shields",
  square_credits: "Square Credits",
  pickem_credits: "Pick'em Credits",
  free_entries: "Free Entries",
  merchandise: "Merchandise",
  collectibles: "Collectibles",
  experiences: "Experiences",
  vacation: "Vacation Giveaways",
  electronics: "Electronics",
  vip: "VIP Rewards",
  travel: "Travel",
};

const CATEGORY_ORDER = [
  "premium_emojis",
  "game_items",
  "square_credits",
  "pickem_credits",
  "free_entries",
  "merchandise",
  "collectibles",
  "experiences",
  "vip",
  "travel",
  "vacation",
  "electronics",
];

export default function CreditShopPanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    if (!data) return {};
    return data.catalog.reduce<Record<string, typeof data.catalog>>((acc, item) => {
      const key = item.category || "other";
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [data]);

  const sortedCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter((key) => byCategory[key]?.length).concat(
        Object.keys(byCategory).filter((key) => !CATEGORY_ORDER.includes(key))
      ),
    [byCategory]
  );

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading Credit Shop…</p>;
  }

  async function redeem(itemId: string, title: string) {
    setBusyId(itemId);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/ecosystem/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ catalogItemId: itemId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "Purchase failed.");
      return;
    }
    setSuccess(`Purchased: ${title} — check Gift Shop or Inventory to use it.`);
    await refresh({ background: true });
  }

  return (
    <div className="space-y-8">
      <LandingGlassCard className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">💎 Credit Shop</p>
            <h2 className="text-xl font-bold text-white mb-2">Spend Tier Credits</h2>
            <p className="text-sm text-sb-muted max-w-xl">
              Buy bonus squares, Pick&apos;em lines, Survivor X shields, board credits, and more
              with the Tier Credits you earn from gameplay.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-sb-muted">Your balance</p>
            <p className="text-3xl font-bold text-sb-purple-light tabular-nums">
              {data.wallet.tierCredits.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mt-1">Tier Credits</p>
          </div>
        </div>
      </LandingGlassCard>

      {success ? <p className="text-sm text-green-300">{success}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {sortedCategories.map((category) => {
        const items = byCategory[category] ?? [];
        const isGameItems = category === "game_items";
        const isPremiumEmojis = category === "premium_emojis";
        return (
          <section key={category}>
            <h3 className="text-lg font-semibold text-white mb-3">
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            {isPremiumEmojis ? (
              <p className="text-xs text-sb-muted mb-3 max-w-2xl">
                Unlock exclusive profile emojis for your Competitor Card — same premiums available
                with SquareWallet cash via Profile → Premiums.
              </p>
            ) : null}
            <div
              className={
                isGameItems || isPremiumEmojis
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  : "grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
              }
            >
              {items.map((item) => {
                const canAfford = data.wallet.tierCredits >= item.creditCost;
                const emojiChar =
                  item.category === "premium_emojis" ? extractLeadingEmoji(item.title) : null;
                return (
                  <LandingGlassCard
                    key={item.id}
                    className={`p-4 flex flex-col gap-3 ${
                      isGameItems
                        ? "border-cyan-500/25 credit-shop-game-item"
                        : isPremiumEmojis
                          ? "border-amber-500/25"
                          : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {emojiChar ? (
                        <span className="text-3xl shrink-0" aria-hidden>
                          {emojiChar}
                        </span>
                      ) : null}
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-xs text-sb-muted mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <span className="text-sm text-sb-purple-light font-semibold tabular-nums">
                        {item.creditCost.toLocaleString()} credits
                      </span>
                      <Button
                        size="sm"
                        disabled={busyId === item.id || !canAfford}
                        onClick={() => void redeem(item.id, item.title)}
                      >
                        {canAfford ? "Buy" : "Need more"}
                      </Button>
                    </div>
                  </LandingGlassCard>
                );
              })}
            </div>
          </section>
        );
      })}

      {!data.catalog.length ? (
        <LandingGlassCard className="p-8 text-center text-sb-muted">
          Credit Shop catalog is loading — run migration 048 in Supabase if game items are missing.
        </LandingGlassCard>
      ) : null}
    </div>
  );
}
