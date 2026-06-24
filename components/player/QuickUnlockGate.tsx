"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import QuickPinPad from "@/components/player/QuickPinPad";
import { Button } from "@/components/ui/Button";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  isAppUnlocked,
  isWebAuthnAvailable,
  markAppUnlocked,
  markLocalUnlock,
} from "@/lib/auth/security/deviceClient";
import {
  fetchAuthBootstrap,
  signInWithBiometric,
} from "@/lib/auth/security/webauthnClient";
import {
  clearQuickPin,
  getQuickPinFailedAttempts,
  isQuickPinEnabledLocally,
  isQuickPinLocked,
  verifyQuickPin,
} from "@/lib/auth/security/quickPin";
import { markWelcomeHomePending } from "@/lib/home/welcomeSession";
import { signOutPlayer } from "@/lib/auth/playerAuthClient";
import { formatStepUpError } from "@/lib/auth/formatPlayerAuthError";

export default function QuickUnlockGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const deviceKey = getOrCreateDeviceKey();
  const device = detectDeviceInfo(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    deviceKey
  );
  const label = biometricLabel(device.platform);

  const unlock = useCallback((playerEmail: string) => {
    markAppUnlocked(playerEmail);
    markLocalUnlock();
    markWelcomeHomePending();
    setLocked(false);
    setError(null);
  }, []);

  const tryBiometricUnlock = useCallback(async (playerEmail: string) => {
    if (!isWebAuthnAvailable()) return false;
    setLoading(true);
    setError(null);
    try {
      await signInWithBiometric(playerEmail);
      unlock(playerEmail);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [unlock]);

  useEffect(() => {
    let cancelled = false;

    async function evaluate() {
      const bootstrap = await fetchAuthBootstrap();
      if (cancelled) return;

      if (!bootstrap.authenticated || !bootstrap.email) {
        setChecking(false);
        setLocked(false);
        return;
      }

      const playerEmail = bootstrap.email;
      setEmail(playerEmail);

      const hasQuickUnlock =
        bootstrap.passkeyAvailable ||
        isQuickPinEnabledLocally(playerEmail);

      if (!hasQuickUnlock || isAppUnlocked(playerEmail)) {
        setLocked(false);
        setChecking(false);
        return;
      }

      setLocked(true);
      setChecking(false);

      const biometricOk = await tryBiometricUnlock(playerEmail);
      if (!cancelled && !biometricOk) {
        setShowPin(isQuickPinEnabledLocally(playerEmail));
      }
    }

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, [tryBiometricUnlock]);

  async function handlePin(pin: string) {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      if (isQuickPinLocked(email)) {
        setError("Quick PIN locked. Use email sign-in.");
        setLoading(false);
        return;
      }

      const ok = await verifyQuickPin(email, pin);
      if (!ok) {
        const attempts = getQuickPinFailedAttempts(email);
        setError(`Incorrect PIN. ${Math.max(0, 5 - attempts)} attempts remaining.`);
        setLoading(false);
        return;
      }

      unlock(email);
    } catch (err) {
      const message = formatStepUpError(
        err instanceof Error ? err.message : "PIN verification failed."
      );
      setError(message);
      if (/locked|too many/i.test(message)) {
        clearQuickPin(email);
        await signOutPlayer();
        router.replace("/my-games/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function useEmailSignIn() {
    await signOutPlayer();
    router.replace("/my-games/login");
  }

  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-sb-muted animate-pulse">Securing your session…</p>
      </div>
    );
  }

  if (!locked) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <LandingGlassCard className="w-full max-w-md p-6 sm:p-8">
          {!showPin ? (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Welcome back</p>
              <h2 className="text-2xl font-bold text-white mb-2">Unlock SquareBoards</h2>
              <p className="text-sm text-sb-muted mb-6">
                Use {label} or your Quick PIN to continue.
              </p>
              {error ? <p className="text-sm text-red-300 mb-4">{error}</p> : null}
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={loading || !isWebAuthnAvailable()}
                  onClick={() => void tryBiometricUnlock(email)}
                >
                  {loading ? "Verifying…" : `Unlock with ${label}`}
                </Button>
                {isQuickPinEnabledLocally(email) ? (
                  <Button variant="secondary" className="w-full" onClick={() => setShowPin(true)}>
                    Use Quick PIN
                  </Button>
                ) : null}
                <Button variant="ghost" className="w-full" onClick={() => void useEmailSignIn()}>
                  Sign in with email
                </Button>
              </div>
            </div>
          ) : (
            <QuickPinPad
              disabled={loading}
              error={error}
              onComplete={handlePin}
              onForgot={() => void useEmailSignIn()}
            />
          )}
        </LandingGlassCard>
      </div>
      <div className="opacity-20 pointer-events-none blur-sm">{children}</div>
    </>
  );
}
