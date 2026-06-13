"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

export default function PasswordSettings() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    const json = (await res.json()) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not update password.");
      return;
    }

    setPassword("");
    setConfirm("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <LandingGlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Password</h3>
      <p className="text-sm text-sb-muted mb-5">
        Set or update your password to sign in without waiting for an email link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="player-input w-full"
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="player-input w-full"
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            Password saved. You can now sign in with your password.
          </p>
        ) : null}

        <Button type="submit" disabled={saving || !password || !confirm}>
          {saving ? "Saving…" : "Save password"}
        </Button>
      </form>
    </LandingGlassCard>
  );
}
