"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/Logo";
import { requestPasswordReset } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { PLAYER_LOGIN } from "@/lib/auth/playerRoutes";

function ForgotPasswordFormInner() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(identifier);
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
            Reset password
          </h1>
          <p className="text-sb-muted text-sm sm:text-base">
            We&apos;ll email you a secure link to choose a new password.
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
                If an account exists for{" "}
                <span className="text-white font-medium">{identifier}</span>, you&apos;ll receive a
                password reset link shortly.
              </p>
              <Button href={PLAYER_LOGIN} variant="primary" className="mt-2">
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-identifier"
                  className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                >
                  Email, username, phone, or Player ID
                </label>
                <input
                  id="forgot-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or ISAIAH742"
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
                {loading ? "Sending link…" : "Send reset link"}
              </Button>
            </form>
          )}
        </LandingGlassCard>

        <p className="text-center text-sb-muted text-xs mt-6">
          Remember your password?{" "}
          <Link href={PLAYER_LOGIN} className="text-sb-glow hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PlayerForgotPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordFormInner />
    </Suspense>
  );
}
