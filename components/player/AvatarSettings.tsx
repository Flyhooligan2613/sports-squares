"use client";

import { useEffect, useMemo, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import AvatarEmojiPicker from "@/components/auth/AvatarEmojiPicker";
import PremiumEmojiShopModal from "@/components/player/PremiumEmojiShopModal";
import { showAuthSuccess } from "@/lib/auth/authSuccessFeedback";
import { DEFAULT_AVATAR, PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

export default function AvatarSettings() {
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [ownedPremiumEmojis, setOwnedPremiumEmojis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumsOpen, setPremiumsOpen] = useState(false);

  const selectableOptions = useMemo(
    () => [...PLAYER_AVATARS, ...ownedPremiumEmojis.filter((e) => !PLAYER_AVATARS.includes(e as never))],
    [ownedPremiumEmojis]
  );

  async function loadAvatar() {
    const res = await fetch("/api/ecosystem/avatar", { cache: "no-store", credentials: "include" });
    const json = (await res.json()) as {
      avatar?: string;
      ownedPremiumEmojis?: string[];
      error?: string;
    };
    if (res.ok && json.avatar) {
      setAvatar(json.avatar);
      setOwnedPremiumEmojis(json.ownedPremiumEmojis ?? []);
    }
  }

  useEffect(() => {
    void loadAvatar().finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/ecosystem/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji: avatar }),
    });
    const json = (await res.json()) as { avatar?: string; error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not update avatar.");
      return;
    }

    if (json.avatar) setAvatar(json.avatar);
    setSuccess(true);
    showAuthSuccess("profile_updated");
    window.dispatchEvent(new CustomEvent("player-profile-updated"));
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <LandingGlassCard className="p-6 text-sm text-sb-muted animate-pulse">
        Loading avatar…
      </LandingGlassCard>
    );
  }

  return (
    <>
      <LandingGlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">
            Profile emoji
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-200 hover:border-amber-400/50"
            onClick={() => setPremiumsOpen(true)}
          >
            ✨ Premiums
          </Button>
        </div>
        <p className="text-xs text-sb-muted mb-4">
          Your emoji appears on leaderboards, wins, and your Competitor Card. Current:{" "}
          <span className="text-2xl align-middle ml-1" aria-hidden>
            {avatar}
          </span>
        </p>

        <AvatarEmojiPicker
          value={avatar}
          onChange={setAvatar}
          disabled={saving}
          compact
          options={selectableOptions}
          premiumEmojis={ownedPremiumEmojis}
        />

        {error ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mt-4">
            Avatar updated!
          </p>
        ) : null}

        <Button type="button" className="mt-4" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save emoji"}
        </Button>
      </LandingGlassCard>

      <PremiumEmojiShopModal
        open={premiumsOpen}
        onClose={() => setPremiumsOpen(false)}
        onPurchased={() => void loadAvatar()}
      />
    </>
  );
}
