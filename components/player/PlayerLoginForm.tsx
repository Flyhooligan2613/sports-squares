"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { signInPlayerWithMagicLink } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import Logo from "@/components/Logo";

export default function PlayerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    router.replace("/my-games/login");

    const result = await signInPlayerWithMagicLink(email);
    setLoading(false);

    if (!result.ok) {
      setError(formatPlayerAuthError(result.error));
      return;
    }

    setSent(true);
  }

  return (
    <div className="player-login-page min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="player-login-glow" aria-hidden />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo href="/" className="sb-logo-nav mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            My Games
          </h1>
          <p className="text-sb-muted text-sm sm:text-base">
            Sign in with the email you used at checkout.
          </p>
        </div>

        <LandingGlassCard glow className="p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sb-purple/20 border border-sb-purple/30 flex items-center justify-center text-2xl">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-white">Check your inbox</h2>
              <p className="text-sb-muted text-sm leading-relaxed">
                We sent a secure sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>. Tap the
                link to open your boards.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="player-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                >
                  Email address
                </label>
                <input
                  id="player-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="player-input w-full"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full player-btn-glow"
                disabled={loading}
              >
                {loading ? "Sending link…" : "Send Magic Link"}
              </Button>
            </form>
          )}
        </LandingGlassCard>

        <p className="text-center text-sb-muted text-xs mt-6">
          New here?{" "}
          <a href="/games/nfl" className="text-sb-glow hover:underline">
            Browse live boards
          </a>
        </p>
      </div>
    </div>
  );
}
