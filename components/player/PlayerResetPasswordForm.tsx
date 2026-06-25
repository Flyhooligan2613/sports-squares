"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/Logo";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { MY_GAMES_HOME, PLAYER_LOGIN } from "@/lib/auth/playerRoutes";

function ResetPasswordFormInner() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(formatPlayerAuthError(body.error ?? "Could not update password."));
      return;
    }

    setDone(true);
    window.setTimeout(() => router.replace(MY_GAMES_HOME), 1800);
  }

  return (
    <div className="player-login-page min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="player-login-glow" aria-hidden />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo href="/" className="sb-logo-nav mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Choose a new password
          </h1>
          <p className="text-sb-muted text-sm sm:text-base">
            At least 8 characters — use something unique to SquareBoards.
          </p>
        </div>

        <LandingGlassCard glow className="p-6 sm:p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white">Password updated</h2>
              <p className="text-sb-muted text-sm">Taking you to My Games…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="player-input w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="player-input w-full"
                />
              </div>

              {error ? (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                className="w-full player-btn-glow sb-btn-press"
                disabled={loading}
              >
                {loading ? "Saving…" : "Update password"}
              </Button>
            </form>
          )}
        </LandingGlassCard>

        {!done ? (
          <p className="text-center text-sb-muted text-xs mt-6">
            Link expired?{" "}
            <a href="/my-games/forgot-password" className="text-sb-glow hover:underline font-medium">
              Request a new one
            </a>
            {" · "}
            <a href={PLAYER_LOGIN} className="text-sb-glow hover:underline">
              Sign in
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PlayerResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
