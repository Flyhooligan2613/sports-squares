"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import QuickPinPad from "@/components/player/QuickPinPad";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  isWebAuthnAvailable,
  markBiometricPromptHandled,
} from "@/lib/auth/security/deviceClient";
import { registerBiometricLogin } from "@/lib/auth/security/webauthnClient";
import { isQuickPinEnabledLocally, setupQuickPin } from "@/lib/auth/security/quickPin";

interface SecurityOnboardingWizardProps {
  open: boolean;
  email: string;
  onComplete: () => void;
}

type Step = "biometric" | "pin" | "done";

export default function SecurityOnboardingWizard({
  open,
  email,
  onComplete,
}: SecurityOnboardingWizardProps) {
  const [step, setStep] = useState<Step>("biometric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  const deviceKey = getOrCreateDeviceKey();
  const device = detectDeviceInfo(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    deviceKey
  );
  const label = biometricLabel(device.platform);
  const webAuthnAvailable = isWebAuthnAvailable();

  useEffect(() => {
    if (!open) return;
    if (!webAuthnAvailable) {
      setStep("pin");
    }
  }, [open, webAuthnAvailable]);

  const finish = useCallback(
    async (flags: { biometricEnabled: boolean; pinEnabled: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        await fetch("/api/auth/security/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(flags),
        });
        markBiometricPromptHandled(email);
        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save security settings.");
      } finally {
        setLoading(false);
      }
    },
    [email, onComplete]
  );

  if (!open) return null;

  async function enableBiometric() {
    setLoading(true);
    setError(null);
    try {
      await registerBiometricLogin(device.deviceName);
      setBiometricEnabled(true);
      setStep("pin");
    } catch (err) {
      if (err instanceof Error && /already|active|registered/i.test(err.message)) {
        setBiometricEnabled(true);
        setStep("pin");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not enable biometrics.");
    } finally {
      setLoading(false);
    }
  }

  async function savePin(pin: string) {
    setLoading(true);
    setError(null);
    try {
      await setupQuickPin(email, pin);
      await fetch("/api/auth/security/pin-enabled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: true }),
      });
      setPinEnabled(true);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save PIN.");
    } finally {
      setLoading(false);
    }
  }

  function skipPin() {
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <LandingGlassCard className="w-full max-w-md p-6 sm:p-8">
        {step === "biometric" ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Step 1 of 3</p>
            <h2 className="text-2xl font-bold text-white mb-2">Enable {label}?</h2>
            <p className="text-sm text-sb-muted leading-relaxed mb-6">
              Unlock SquareBoards instantly next time. Your email is verified once — future unlocks use
              {` ${label.toLowerCase()}.`}
            </p>
            {error ? <p className="text-sm text-red-300 mb-4">{error}</p> : null}
            <div className="flex flex-col gap-3">
              <Button className="w-full" disabled={loading} onClick={() => void enableBiometric()}>
                {loading ? "Setting up…" : `Enable ${label}`}
              </Button>
              <Button variant="ghost" className="w-full" disabled={loading} onClick={() => setStep("pin")}>
                Skip for now
              </Button>
            </div>
          </>
        ) : null}

        {step === "pin" ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Step 2 of 3</p>
            <QuickPinPad
              title="Create Quick PIN"
              subtitle="4 digits — stored only on this device, never sent to our servers"
              confirmMode
              disabled={loading}
              error={error}
              onComplete={savePin}
            />
            <div className="mt-4">
              <Button variant="ghost" className="w-full" disabled={loading} onClick={skipPin}>
                Skip for now
              </Button>
            </div>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Step 3 of 3</p>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re all set!</h2>
            <p className="text-sm text-sb-muted mb-4">Next time simply unlock with:</p>
            <ul className="space-y-2 text-sm text-white mb-6">
              {biometricEnabled || webAuthnAvailable ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  👆 {label}
                </li>
              ) : null}
              {(pinEnabled || isQuickPinEnabledLocally(email)) ? (
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  🔢 Quick PIN
                </li>
              ) : (
                <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  ✉️ Secure email session (Keep Me Signed In)
                </li>
              )}
            </ul>
            <Button
              className="w-full"
              disabled={loading}
              onClick={() =>
                void finish({
                  biometricEnabled: biometricEnabled || webAuthnAvailable,
                  pinEnabled: pinEnabled || isQuickPinEnabledLocally(email),
                })
              }
            >
              {loading ? "Saving…" : "Continue to SquareBoards"}
            </Button>
          </>
        ) : null}
      </LandingGlassCard>
    </div>
  );
}
