"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { GENESIS_PROFILE_UNLOCKS } from "@/lib/platform/engines/genesis";
import { useGenesis } from "@/components/genesis/GenesisProvider";

export default function GenesisProfileCustomization() {
  const { progress } = useGenesis();
  const [bio, setBio] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/profile", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        setBio(json.identity?.bio ?? "");
        setFavoriteTeam(json.identity?.favoriteTeam ?? "");
      })
      .catch(() => undefined);
  }, []);

  if (!progress?.customizationUnlocked) return null;

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bio: bio.trim(),
        favoriteTeam: favoriteTeam.trim() || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Could not save — try again.");
      return;
    }
    setMessage("Profile updated — mission progress may update shortly.");
    window.dispatchEvent(new CustomEvent("player-profile-updated"));
  }

  return (
    <LandingGlassCard className="p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-wider text-sb-glow mb-1">Rookie Unlocks</p>
      <h3 className="text-lg font-bold text-white mb-2">Customize your Competitor Card</h3>
      <p className="text-xs text-sb-muted mb-5">
        Unlocked for Rookie Season: {GENESIS_PROFILE_UNLOCKS.join(" · ")}
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="genesis-bio" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Bio
          </label>
          <textarea
            id="genesis-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            className="player-input w-full min-h-[80px]"
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="genesis-team" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Favorite team
          </label>
          <input
            id="genesis-team"
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            className="player-input w-full"
            placeholder="e.g. Kansas City Chiefs"
          />
        </div>
        <div>
          <label htmlFor="genesis-theme" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Theme accent
          </label>
          <input
            id="genesis-theme"
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-20 rounded-lg border border-white/10 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-300 mt-4">{message}</p> : null}

      <Button className="mt-5" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Save customization"}
      </Button>
    </LandingGlassCard>
  );
}
