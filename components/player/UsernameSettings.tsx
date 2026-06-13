"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface UsernameEligibility {
  username: string | null;
  playerId: string;
  requiresCredits: boolean;
  creditCost: number;
  availableCredits: number;
  freeChangeDays: number;
  daysUntilFreeChange: number;
}

export default function UsernameSettings() {
  const [data, setData] = useState<UsernameEligibility | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void fetch("/api/ecosystem/username", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        const payload = json as UsernameEligibility;
        setData(payload);
        setUsername(payload.username ?? "");
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
      body: JSON.stringify({ username }),
    });
    const json = (await res.json()) as UsernameEligibility & { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not update username.");
      return;
    }

    setData(json);
    setUsername(json.username ?? username);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <LandingGlassCard className="p-6 text-sm text-sb-muted animate-pulse">
        Loading username settings…
      </LandingGlassCard>
    );
  }

  const costNote = data?.requiresCredits
    ? `Changing your username now costs ${data.creditCost.toLocaleString()} Tier Credits. Free change in ${data.daysUntilFreeChange} day${data.daysUntilFreeChange === 1 ? "" : "s"}.`
    : data?.username
      ? `You can change your username for free (once every ${data.freeChangeDays} days).`
      : "Choose a username — your first change is free.";

  return (
    <LandingGlassCard className="p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2">
        Username
      </h2>
      <p className="text-xs text-sb-muted mb-4">
        Used for login, leaderboards, and your public player card. Player ID:{" "}
        <span className="font-mono text-white">{data?.playerId}</span>
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Display username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            maxLength={20}
            minLength={3}
            placeholder="isaiah"
            className="player-input w-full"
            autoComplete="username"
          />
          <p className="text-xs text-sb-muted mt-2">3–20 characters · letters, numbers, underscore</p>
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
            Username updated!
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={saving || username.length < 3 || username === data?.username}
        >
          {saving ? "Saving…" : "Save username"}
        </Button>
      </form>
    </LandingGlassCard>
  );
}
