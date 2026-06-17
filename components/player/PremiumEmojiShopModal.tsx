"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AutomationModalShell from "@/components/square-pass/automation/AutomationModalShell";
import { Button } from "@/components/ui/Button";
import { formatPremiumEmojiPrice } from "@/lib/platform/ecosystem/premiumEmojis";

interface PremiumEmojiItem {
  id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  cashCents: number;
  creditCost: number;
  packSlugs: string[];
}

interface PremiumEmojiShopModalProps {
  open: boolean;
  onClose: () => void;
  onPurchased?: (emoji: string) => void;
}

export default function PremiumEmojiShopModal({
  open,
  onClose,
  onPurchased,
}: PremiumEmojiShopModalProps) {
  const [catalog, setCatalog] = useState<PremiumEmojiItem[]>([]);
  const [ownedSlugs, setOwnedSlugs] = useState<string[]>([]);
  const [walletAvailableCents, setWalletAvailableCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadShop = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ecosystem/premium-emojis", {
      cache: "no-store",
      credentials: "include",
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not load premium emojis.");
      return;
    }
    const json = (await res.json()) as {
      catalog?: PremiumEmojiItem[];
      ownedSlugs?: string[];
      walletAvailableCents?: number;
    };
    setCatalog(json.catalog ?? []);
    setOwnedSlugs(json.ownedSlugs ?? []);
    setWalletAvailableCents(json.walletAvailableCents ?? 0);
  }, []);

  useEffect(() => {
    if (open) void loadShop();
  }, [open, loadShop]);

  async function purchase(slug: string, title: string, emoji: string) {
    setBusySlug(slug);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/ecosystem/premium-emojis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ slug }),
    });
    setBusySlug(null);
    const json = (await res.json()) as { error?: string; emoji?: string; ownedSlugs?: string[] };
    if (!res.ok) {
      setError(json.error ?? "Purchase failed.");
      return;
    }
    setOwnedSlugs(json.ownedSlugs ?? []);
    setSuccess(`Unlocked ${title} ${emoji}`);
    onPurchased?.(json.emoji ?? emoji);
    window.dispatchEvent(new CustomEvent("player-profile-updated"));
    await loadShop();
  }

  return (
    <AutomationModalShell open={open}>
      <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-1">Premium Emojis</p>
            <h2 className="text-xl font-bold text-white">Upgrade your Competitor Card</h2>
            <p className="text-xs text-sb-muted mt-1 max-w-md">
              Stand out on leaderboards and your profile with exclusive emojis. Purchased with
              SquareWallet™ available cash.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sb-muted hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 mb-5 flex flex-wrap justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted">Wallet balance</p>
            <p className="text-lg font-bold text-white tabular-nums">
              {formatPremiumEmojiPrice(walletAvailableCents)}
            </p>
          </div>
          <Link
            href="/my-games/wallet"
            className="text-xs text-sb-glow self-center hover:underline"
          >
            Add funds →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-sb-muted animate-pulse py-8 text-center">Loading premiums…</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
            {success}
          </p>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          {catalog.map((item) => {
            const owned = ownedSlugs.includes(item.slug);
            const packOwned =
              item.packSlugs.length > 0 &&
              item.packSlugs.every((s) => ownedSlugs.includes(s));
            const isOwned = owned || packOwned;
            const canAfford = walletAvailableCents >= item.cashCents;

            return (
              <div
                key={item.slug}
                className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0" aria-hidden>
                    {item.emoji}
                  </span>
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-xs text-sb-muted mt-1 leading-relaxed">{item.description}</p>
                    {item.packSlugs.length ? (
                      <p className="text-[10px] text-amber-200/80 mt-1 uppercase tracking-wider">
                        Pack · 3 emojis
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-sm font-bold text-amber-200 tabular-nums">
                    {formatPremiumEmojiPrice(item.cashCents)}
                  </span>
                  {isOwned ? (
                    <span className="text-xs text-emerald-400 font-medium">Owned</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={busySlug === item.slug || !canAfford}
                      onClick={() => void purchase(item.slug, item.title, item.emoji)}
                    >
                      {canAfford ? "Buy" : "Need funds"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-sb-muted mt-5 text-center">
          Also available in the{" "}
          <Link href="/my-games/rewards/credit-shop" className="text-sb-glow hover:underline">
            Credit Shop
          </Link>{" "}
          with Tier Credits.
        </p>
      </div>
    </AutomationModalShell>
  );
}
