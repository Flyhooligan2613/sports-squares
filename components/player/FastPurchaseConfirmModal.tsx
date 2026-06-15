"use client";

import { useCallback, useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import QuickPinPad from "@/components/player/QuickPinPad";
import { Button } from "@/components/ui/Button";
import {
  biometricLabel,
  detectDeviceInfo,
  getOrCreateDeviceKey,
  getStepUpToken,
  isWebAuthnAvailable,
  setStepUpToken,
} from "@/lib/auth/security/deviceClient";
import { confirmFastAction } from "@/lib/auth/security/fastConfirm";
import { isQuickPinEnabledLocally } from "@/lib/auth/security/quickPin";

import { CONTEST_CTAS } from "@/lib/platform/language";
import type { StepUpPurpose } from "@/lib/auth/security/stepUp";

interface FastPurchaseConfirmModalProps {
  open: boolean;
  email: string;
  purpose?: StepUpPurpose;
  title?: string;
  subtitle?: string;
  kicker?: string;
  pinTitle?: string;
  pinSubtitle?: string;
  amountLabel?: string;
  onClose: () => void;
  onConfirmed: (stepUpToken: string) => void | Promise<void>;
}

export default function FastPurchaseConfirmModal({
  open,
  email,
  purpose = "purchase",
  title = CONTEST_CTAS.lockInYourContest,
  subtitle = "Verify with biometrics or Quick PIN",
  kicker = "Fast checkout",
  pinTitle = CONTEST_CTAS.lockInYourContest,
  pinSubtitle = "Enter your Quick PIN to complete payment",
  amountLabel,
  onClose,
  onConfirmed,
}: FastPurchaseConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const device = detectDeviceInfo(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    getOrCreateDeviceKey()
  );
  const label = biometricLabel(device.platform);

  const complete = useCallback(
    async (token: string) => {
      setStepUpToken(token);
      await onConfirmed(token);
    },
    [onConfirmed]
  );

  const tryBiometric = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await confirmFastAction(purpose, email);
      await complete(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
      if (isQuickPinEnabledLocally(email)) setShowPin(true);
    } finally {
      setLoading(false);
    }
  }, [complete, email, purpose]);

  useEffect(() => {
    if (!open) {
      setShowPin(false);
      setError(null);
      return;
    }

    const existing = getStepUpToken();
    if (existing) {
      void complete(existing);
      return;
    }

    if (isWebAuthnAvailable()) {
      void tryBiometric();
    } else if (isQuickPinEnabledLocally(email)) {
      setShowPin(true);
    }
  }, [open, email, complete, tryBiometric]);

  if (!open) return null;

  async function handlePin(pin: string) {
    setLoading(true);
    setError(null);
    try {
      const token = await confirmFastAction(purpose, email, pin);
      await complete(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect PIN.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <LandingGlassCard className="w-full max-w-md p-6 sm:p-8">
        {!showPin ? (
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-2">{kicker}</p>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-sb-muted mb-2">{subtitle}</p>
            {amountLabel ? (
              <p className="text-xl font-semibold text-white mb-6">{amountLabel}</p>
            ) : (
              <div className="mb-6" />
            )}
            {error ? <p className="text-sm text-red-300 mb-4">{error}</p> : null}
            <div className="flex flex-col gap-3">
              <Button className="w-full" disabled={loading} onClick={() => void tryBiometric()}>
                {loading ? "Confirming…" : `Confirm with ${label}`}
              </Button>
              {isQuickPinEnabledLocally(email) ? (
                <Button variant="secondary" className="w-full" onClick={() => setShowPin(true)}>
                  Use Quick PIN
                </Button>
              ) : null}
              <Button variant="ghost" className="w-full" disabled={loading} onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <QuickPinPad
              title={pinTitle}
              subtitle={pinSubtitle}
              disabled={loading}
              error={error}
              onComplete={handlePin}
            />
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowPin(false)}>
              Back
            </Button>
          </>
        )}
      </LandingGlassCard>
    </div>
  );
}
