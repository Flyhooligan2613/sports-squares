"use client";

import { useEffect, useState } from "react";
import { AUTOMATION_COPY } from "@/lib/platform/engines/squarePass/automation/config";
import { GENESIS_PROFILE_UNLOCKS } from "@/lib/platform/engines/genesis";
import AutomationModalShell, { ContinueJourneyButton } from "./AutomationModalShell";

interface ProfileCustomizationPromptProps {
  open: boolean;
  onContinue: () => void;
}

export default function ProfileCustomizationPrompt({
  open,
  onContinue,
}: ProfileCustomizationPromptProps) {
  const [bio, setBio] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/profile", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        setBio(json.identity?.bio ?? "");
        setFavoriteTeam(json.identity?.favoriteTeam ?? "");
      })
      .catch(() => undefined);
  }, [open]);

  async function saveAndContinue() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bio: bio.trim(),
        favoriteTeam: favoriteTeam.trim() || null,
      }),
    }).catch(() => undefined);
    setSaving(false);
    window.dispatchEvent(new CustomEvent("player-profile-updated"));
    onContinue();
  }

  return (
    <AutomationModalShell open={open}>
      <div className="p-8 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">{AUTOMATION_COPY.profileTitle}</h2>
          <p className="text-sm text-sb-muted">{AUTOMATION_COPY.profileMessage}</p>
          <p className="text-[10px] uppercase tracking-wider text-sb-glow">
            {GENESIS_PROFILE_UNLOCKS.join(" · ")}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="sp-bio" className="block text-xs font-semibold uppercase text-sb-muted mb-1">
              Bio
            </label>
            <textarea
              id="sp-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 120))}
              className="player-input w-full min-h-[72px]"
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="sp-sport" className="block text-xs font-semibold uppercase text-sb-muted mb-1">
              Favorite sport
            </label>
            <select
              id="sp-sport"
              value={favoriteSport}
              onChange={(e) => setFavoriteSport(e.target.value)}
              className="player-input w-full"
            >
              <option value="">Select sport</option>
              <option value="nfl">NFL</option>
              <option value="mlb">MLB</option>
              <option value="nba">NBA</option>
              <option value="soccer">Soccer</option>
            </select>
          </div>
          <div>
            <label htmlFor="sp-team" className="block text-xs font-semibold uppercase text-sb-muted mb-1">
              Favorite team
            </label>
            <input
              id="sp-team"
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              className="player-input w-full"
              placeholder="Your team"
            />
          </div>
        </div>

        <ContinueJourneyButton onClick={() => void saveAndContinue()} loading={saving} />
      </div>
    </AutomationModalShell>
  );
}
