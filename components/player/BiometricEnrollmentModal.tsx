"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  isWebAuthnAvailable,
  markBiometricPromptHandled,
  wasBiometricPromptHandled,
} from "@/lib/auth/security/deviceClient";
import {
  fetchAuthBootstrap,
  registerBiometricLogin,
} from "@/lib/auth/security/webauthnClient";

interface BiometricEnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  onEnabled: () => void;
  email: string;
}

export default function BiometricEnrollmentModal({
  open,
  onClose,
  onEnabled,
  email,
}: BiometricEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deviceKey = getOrCreateDeviceKey();
  const device = detectDeviceInfo(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    deviceKey
  );
  const label = biometricLabel(device.platform);

  if (!open || !isWebAuthnAvailable()) return null;

  async function enableBiometric() {
    setLoading(true);
    setError(null);
    try {
      await registerBiometricLogin(device.deviceName);
      markBiometricPromptHandled(email);
      onEnabled();
      onClose();
    } catch (err) {
      if (err instanceof Error && /already|active|registered/i.test(err.message)) {
        markBiometricPromptHandled(email);
        onEnabled();
        onClose();
        return;
      }
      setError(err instanceof Error ? err.message : "Could not enable biometric login.");
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    markBiometricPromptHandled(email);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <LandingGlassCard className="w-full max-w-md p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">Security</p>
        <h2 className="text-2xl font-bold text-white mb-2">Enable {label}?</h2>
        <p className="text-sm text-sb-muted leading-relaxed mb-6">
          Sign in faster on this device next time. Your email is verified once — future unlocks use
          {` ${label.toLowerCase()}.`}
        </p>

        {error ? (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button className="w-full" disabled={loading} onClick={() => void enableBiometric()}>
            {loading ? "Setting up…" : `Enable ${label}`}
          </Button>
          <Button variant="ghost" className="w-full" disabled={loading} onClick={dismiss}>
            Not now
          </Button>
        </div>
      </LandingGlassCard>
    </div>
  );
}

export function useBiometricEnrollmentPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!isWebAuthnAvailable()) return;
      const bootstrap = await fetchAuthBootstrap();
      if (cancelled || !bootstrap.authenticated || !bootstrap.email) return;
      if (bootstrap.passkeyAvailable) return;
      if (wasBiometricPromptHandled(bootstrap.email)) return;

      setEmail(bootstrap.email);
      setShowPrompt(true);
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismissPrompt() {
    if (email) markBiometricPromptHandled(email);
    setShowPrompt(false);
  }

  function markEnabled() {
    if (email) markBiometricPromptHandled(email);
    setShowPrompt(false);
  }

  return { showPrompt, dismissPrompt, markEnabled, email };
}
