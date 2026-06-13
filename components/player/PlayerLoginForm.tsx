"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { signInPlayerWithMagicLink } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import Logo from "@/components/Logo";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  getRememberMePreference,
  getRequiresEmailSignIn,
  isWebAuthnAvailable,
  setRememberMePreference,
} from "@/lib/auth/security/deviceClient";
import {
  fetchAuthBootstrap,
  signInWithBiometric,
} from "@/lib/auth/security/webauthnClient";

export default function PlayerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const deviceKey = getOrCreateDeviceKey();
  const device = detectDeviceInfo(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    deviceKey
  );
  const biometricName = biometricLabel(device.platform);
  const webAuthnSupported = isWebAuthnAvailable();

  useEffect(() => {
    setRememberMe(getRememberMePreference());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const bootstrapData = await fetchAuthBootstrap(email || undefined);
      if (cancelled) return;

      if (bootstrapData.authenticated) {
        router.replace("/my-games");
        return;
      }

      const canUsePasskey =
        Boolean(email) &&
        Boolean(bootstrapData.passkeyAvailable) &&
        !getRequiresEmailSignIn();
      setPasskeyAvailable(canUsePasskey);

      setCheckingSession(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [email, router]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    router.replace("/my-games/login");
    setRememberMePreference(rememberMe);

    const result = await signInPlayerWithMagicLink(email, {
      rememberMe,
      deviceKey,
    });
    setLoading(false);

    if (!result.ok) {
      setError(formatPlayerAuthError(result.error));
      return;
    }

    setSent(true);
  }

  async function handleBiometricSignIn() {
    if (!email.trim()) {
      setError("Enter your email first, then use biometric sign-in.");
      return;
    }

    setLoading(true);
    setError(null);
    setRememberMePreference(rememberMe);

    try {
      await signInWithBiometric(email.trim().toLowerCase(), rememberMe);
      router.replace("/my-games");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Biometric sign-in failed. Use your email link instead."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="player-login-page min-h-screen flex items-center justify-center text-sb-muted">
        Loading…
      </div>
    );
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
            Verify your email once. Stay signed in securely on trusted devices.
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
                We sent a one-time verification link to{" "}
                <span className="text-white font-medium">{email}</span>. After you confirm, this
                device will be trusted for faster sign-in.
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
            <form onSubmit={handleMagicLink} className="space-y-5">
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

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-sb-muted leading-relaxed">
                  <span className="text-white font-medium">Keep me signed in</span>
                  <br />
                  Secure persistent session on this device — like ESPN or DraftKings.
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {webAuthnSupported && passkeyAvailable ? (
                <Button
                  type="button"
                  className="w-full player-btn-glow"
                  disabled={loading}
                  onClick={() => void handleBiometricSignIn()}
                >
                  {loading ? "Unlocking…" : `Unlock with ${biometricName}`}
                </Button>
              ) : null}

              <Button
                type="submit"
                variant={passkeyAvailable ? "secondary" : "primary"}
                className={`w-full ${passkeyAvailable ? "" : "player-btn-glow"}`}
                disabled={loading}
              >
                {loading ? "Sending link…" : passkeyAvailable ? "Email me a sign-in link" : "Continue with email"}
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
