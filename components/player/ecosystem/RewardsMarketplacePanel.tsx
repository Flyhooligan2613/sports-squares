"use client";

import { useState } from "react";
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
  square_credits: "Square Credits",
  pickem_credits: "Pick'em Credits",
  free_entries: "Free Entries",
  merchandise: "Merchandise",
  collectibles: "Collectibles",
  experiences: "Experiences",
  vacation: "Vacation Giveaways",
  electronics: "Electronics",
  vip: "VIP Rewards",
};

export default function RewardsMarketplacePanel() {
  const { data, loading, refresh } = useRewardsCenter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading marketplace…</p>;
  }

  const byCategory = data.catalog.reduce<Record<string, typeof data.catalog>>((acc, item) => {
    const key = item.category || "other";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

  async function redeem(itemId: string) {
    setBusyId(itemId);
    setError(null);
    const res = await fetch("/api/ecosystem/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ catalogItemId: itemId }),
    });
    setBusyId(null);
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "Redemption failed.");
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-8">
      <LandingGlassCard className="p-4 flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm text-sb-muted">Available to spend</p>
          <p className="text-2xl font-bold text-sb-purple-light">
            {data.wallet.tierCredits.toLocaleString()} Tier Credits
          </p>
        </div>
        <p className="text-xs text-sb-muted max-w-sm self-center">
          Redeem credits for Square entries, Pick&apos;em passes, merch, collectibles, and VIP
          experiences. Higher tiers unlock exclusive rewards.
        </p>
      </LandingGlassCard>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {Object.entries(byCategory)
        .sort(([a], [b]) => {
          if (a === "premium_emojis") return -1;
          if (b === "premium_emojis") return 1;
          return 0;
        })
        .map(([category, items]) => (
        <section key={category}>
          <h3 className="text-lg font-semibold text-white mb-3">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          {category === "premium_emojis" ? (
            <p className="text-xs text-sb-muted mb-3 max-w-2xl">
              Exclusive Competitor Card emojis — also purchasable with wallet cash from Profile
              settings.
            </p>
          ) : null}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const emojiChar =
                category === "premium_emojis" ? extractLeadingEmoji(item.title) : null;
              return (
              <LandingGlassCard
                key={item.id}
                className={`p-4 flex flex-col gap-3 ${
                  category === "premium_emojis" ? "border-amber-500/25" : ""
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
                    <p className="text-xs text-sb-muted mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-sm text-sb-purple-light font-semibold">
                    {item.creditCost.toLocaleString()} credits
                  </span>
                  <Button
                    size="sm"
                    disabled={busyId === item.id || data.wallet.tierCredits < item.creditCost}
                    onClick={() => void redeem(item.id)}
                  >
                    Redeem
                  </Button>
                </div>
              </LandingGlassCard>
            );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
