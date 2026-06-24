"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { signInPlayerWithMagicLink, signInPlayerWithPassword } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError, formatStepUpError } from "@/lib/auth/formatPlayerAuthError";
import { openSignupPrompt } from "@/lib/auth/signupPrompt";
import Logo from "@/components/Logo";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  getRememberMePreference,
  isWebAuthnAvailable,
  markAppUnlocked,
  setRememberMePreference,
} from "@/lib/auth/security/deviceClient";
import { markWelcomeHomePending } from "@/lib/home/welcomeSession";
import {
  fetchAuthBootstrap,
  signInWithBiometric,
} from "@/lib/auth/security/webauthnClient";
import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";

function PlayerLoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const referralCode = searchParams.get("ref") ?? "";
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [signInMode, setSignInMode] = useState<"password" | "email">("password");
  const [password, setPassword] = useState("");

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

      const canUsePasskey = Boolean(email) && Boolean(bootstrapData.passkeyAvailable);
      setPasskeyAvailable(canUsePasskey);

      setCheckingSession(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [email, router]);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRememberMePreference(rememberMe);

    const result = await signInPlayerWithPassword(email, password, {
      rememberMe,
      deviceKey,
      referralCode: referralCode || undefined,
    });
    setLoading(false);

    if (!result.ok) {
      setError(formatPlayerAuthError(result.error));
      return;
    }

    markAppUnlocked(email.trim().toLowerCase());
    markWelcomeHomePending();
    router.replace("/my-games");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    router.replace("/my-games/login");
    setRememberMePreference(rememberMe);

    const result = await signInPlayerWithMagicLink(email, {
      rememberMe,
      deviceKey,
      referralCode: referralCode || undefined,
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
      markAppUnlocked(email.trim().toLowerCase());
      markWelcomeHomePending();
      router.replace("/my-games");
    } catch (err) {
      setError(
        err instanceof Error
          ? formatStepUpError(err.message)
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
            {passkeyAvailable
              ? "Welcome back — unlock with biometrics or use your email as backup."
              : "Verify your email once. Stay signed in securely on trusted devices."}
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
                We sent a sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>. Tap it to open My Games —
                you only need this when biometrics are unavailable.
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
            <>
              <div className="sb-tab-group relative flex rounded-xl border border-white/10 p-1 mb-5">
                <span
                  className="sb-tab-indicator"
                  aria-hidden
                  style={{
                    transform: signInMode === "password" ? "translateX(0)" : "translateX(100%)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSignInMode("password")}
                  className={[
                    "sb-tab-option flex-1 py-2 text-sm font-medium rounded-lg relative z-[1]",
                    signInMode === "password" ? "text-white" : "text-sb-muted hover:text-white",
                  ].join(" ")}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setSignInMode("email")}
                  className={[
                    "sb-tab-option flex-1 py-2 text-sm font-medium rounded-lg relative z-[1]",
                    signInMode === "email" ? "text-white" : "text-sb-muted hover:text-white",
                  ].join(" ")}
                >
                  Email link
                </button>
              </div>

              <form
                onSubmit={signInMode === "password" ? handlePasswordSignIn : handleMagicLink}
                className="space-y-5"
              >
              <div>
                <label
                  htmlFor="player-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                >
                  Email, username, phone, or Player ID
                </label>
                <input
                  id="player-email"
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com or ISAIAH742"
                  className="player-input w-full"
                />
              </div>

              {signInMode === "password" ? (
                <div>
                  <label
                    htmlFor="player-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-sb-muted mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="player-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="player-input w-full"
                  />
                  <p className="text-xs text-sb-muted mt-2">
                    No password yet? Sign in with an email link, then set one under Security.
                  </p>
                </div>
              ) : null}

              {referralCode ? (
                <p className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  Referral code <span className="font-mono font-semibold">{referralCode}</span> will be
                  applied when you sign in.
                </p>
              ) : null}

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
                className={`w-full ${passkeyAvailable && signInMode === "email" ? "" : "player-btn-glow"}`}
                disabled={loading}
              >
                {loading
                  ? signInMode === "password"
                    ? "Signing in…"
                    : "Sending link…"
                  : signInMode === "password"
                    ? "Sign in with password"
                    : passkeyAvailable
                      ? "Email me a sign-in link"
                      : "Continue with email"}
              </Button>
            </form>
            </>
          )}
        </LandingGlassCard>

        <p className="text-center text-sb-muted text-xs mt-6 leading-relaxed max-w-sm mx-auto">
          New here?{" "}
          <button
            type="button"
            onClick={() => openSignupPrompt()}
            className="text-sb-glow hover:underline font-medium"
          >
            Create a free account
          </button>
          {" · "}
          <a href="/games/nfl" className="text-sb-glow hover:underline">
            Browse live boards
          </a>
          <span className="block mt-2 text-[11px] text-sb-muted/90">
            After sign-up you&apos;ll connect a free Stripe cash-out profile (~2 min) — required
            to buy squares and receive winnings. {TRUST_MESSAGES.cashOutDebitTip}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function PlayerLoginForm() {
  return (
    <Suspense fallback={null}>
      <PlayerLoginFormInner />
    </Suspense>
  );
}
