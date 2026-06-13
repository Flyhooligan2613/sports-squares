"use client";

import { useEffect } from "react";
import BiometricEnrollmentModal, {
  useBiometricEnrollmentPrompt,
} from "@/components/player/BiometricEnrollmentModal";
import {
  getOrCreateDeviceKey,
  getRememberMePreference,
  getRequiresEmailSignIn,
  setRequiresEmailSignIn,
} from "@/lib/auth/security/deviceClient";
import { registerDeviceAfterLogin } from "@/lib/auth/security/webauthnClient";

export default function PlayerAuthBootstrap() {
  const { showPrompt, dismissPrompt, markEnabled } = useBiometricEnrollmentPrompt();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const deviceKey = getOrCreateDeviceKey();
      const res = await fetch(`/api/auth/bootstrap?deviceKey=${encodeURIComponent(deviceKey)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as { authenticated?: boolean };

      if (cancelled || !data.authenticated) return;

      await registerDeviceAfterLogin(getRememberMePreference());
      if (!getRequiresEmailSignIn()) {
        setRequiresEmailSignIn(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BiometricEnrollmentModal
      open={showPrompt}
      onClose={dismissPrompt}
      onEnabled={markEnabled}
    />
  );
}
