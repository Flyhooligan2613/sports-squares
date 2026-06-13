"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface ProfileSettings {
  username: string | null;
  playerId: string;
  profileBio: string | null;
  requiresCredits: boolean;
  creditCost: number;
  availableCredits: number;
  freeChangeDays: number;
  daysUntilFreeChange: number;
  publicLabel?: string;
}

export default function UsernameSettings() {
  const [data, setData] = useState<ProfileSettings | null>(null);
  const [username, setUsername] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void fetch("/api/ecosystem/username", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        const payload = json as ProfileSettings;
        setData(payload);
        setUsername(payload.username ?? "");
        setProfileBio(payload.profileBio ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/ecosystem/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, profileBio }),
    });
    const json = (await res.json()) as ProfileSettings & { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not update profile.");
      return;
    }

    setData(json);
    setUsername(json.username ?? username);
    setProfileBio(json.profileBio ?? profileBio);
    setSuccess(true);
    window.dispatchEvent(new CustomEvent("player-profile-updated"));
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <LandingGlassCard className="p-6 text-sm text-sb-muted animate-pulse">
        Loading profile settings…
      </LandingGlassCard>
    );
  }

  const costNote = data?.requiresCredits
    ? `Changing your username now costs ${data.creditCost.toLocaleString()} Tier Credits. Free change in ${data.daysUntilFreeChange} day${data.daysUntilFreeChange === 1 ? "" : "s"}.`
    : data?.username
      ? `You can change your username for free (once every ${data.freeChangeDays} days).`
      : "Pick a username — emoji and creative names welcome. Your real name never has to show.";

  return (
    <LandingGlassCard className="p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2">
        Public Profile
      </h2>
      <p className="text-xs text-sb-muted mb-4">
        Your username appears on leaderboards, wins, and your player card. Player ID:{" "}
        <span className="font-mono text-white">{data?.playerId}</span>
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 24))}
            maxLength={24}
            minLength={3}
            placeholder="🔥 GridKing99"
            className="player-input w-full text-lg"
            autoComplete="username"
          />
          <p className="text-xs text-sb-muted mt-2">
            3–24 characters · letters, numbers, emoji, spaces, _ . -
          </p>
        </div>

        <div>
          <label htmlFor="profile-bio" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Bio caption
          </label>
          <textarea
            id="profile-bio"
            value={profileBio}
            onChange={(e) => setProfileBio(e.target.value.slice(0, 120))}
            maxLength={120}
            rows={2}
            placeholder="Squares fan since day one 🏈 — chasing Q4 wins every Sunday."
            className="player-input w-full resize-none"
          />
          <p className="text-xs text-sb-muted mt-2">{profileBio.length}/120 · Keep it respectful</p>
        </div>

        <p className="text-xs text-sb-muted">{costNote}</p>
        {data?.requiresCredits ? (
          <p className="text-xs text-sb-purple-light">
            Balance: {data.availableCredits.toLocaleString()} Tier Credits
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            Profile updated!
          </p>
        ) : null}

        <Button type="submit" disabled={saving || username.length < 3}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </LandingGlassCard>
  );
}
