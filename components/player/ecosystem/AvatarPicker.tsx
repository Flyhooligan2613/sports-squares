"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import PremiumEmojiShopModal from "@/components/player/PremiumEmojiShopModal";
import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

export default function AvatarPicker({
  current,
  onChanged,
}: {
  current?: string;
  onChanged?: (emoji: string) => void;
}) {
  const [selected, setSelected] = useState(current ?? "🎮");
  const [ownedPremiumEmojis, setOwnedPremiumEmojis] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [premiumsOpen, setPremiumsOpen] = useState(false);

  const options = useMemo(
    () => [...PLAYER_AVATARS, ...ownedPremiumEmojis.filter((e) => !PLAYER_AVATARS.includes(e as never))],
    [ownedPremiumEmojis]
  );

  useEffect(() => {
    void fetch("/api/ecosystem/avatar", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        setOwnedPremiumEmojis(json.ownedPremiumEmojis ?? []);
      })
      .catch(() => undefined);
  }, []);

  async function save(emoji: string) {
    setSelected(emoji);
    setBusy(true);
    setSaved(false);
    const res = await fetch("/api/ecosystem/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      onChanged?.(emoji);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function reloadOwned() {
    void fetch("/api/ecosystem/avatar", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        setOwnedPremiumEmojis(json.ownedPremiumEmojis ?? []);
      })
      .catch(() => undefined);
  }

  const premiumSet = new Set(ownedPremiumEmojis);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-white">Choose your avatar</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-200"
          onClick={() => setPremiumsOpen(true)}
        >
          ✨ Premiums
        </Button>
      </div>
      <p className="text-xs text-sb-muted mb-3">
        Shown on leaderboards, profile, referrals, and live feed.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={busy}
            onClick={() => void save(emoji)}
            className={[
              "relative w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition-all",
              selected === emoji
                ? "border-sb-purple bg-sb-purple/20 scale-110"
                : "border-white/10 bg-white/[0.03] hover:border-white/25",
              premiumSet.has(emoji) ? "border-amber-500/40" : "",
            ].join(" ")}
            aria-label={`Avatar ${emoji}`}
          >
            {emoji}
            {premiumSet.has(emoji) ? (
              <span className="absolute -top-1 -right-1 text-[8px] text-amber-300" aria-hidden>
                ✦
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {saved ? <p className="text-xs text-emerald-400">Avatar saved!</p> : null}

      <PremiumEmojiShopModal
        open={premiumsOpen}
        onClose={() => setPremiumsOpen(false)}
        onPurchased={() => reloadOwned()}
      />
    </div>
  );
}
