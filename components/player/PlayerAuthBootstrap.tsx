"use client";

import { useEffect, useState } from "react";
import SecurityOnboardingWizard from "@/components/player/SecurityOnboardingWizard";
import NewDeviceAlertModal from "@/components/player/NewDeviceAlertModal";
import {
  getOrCreateDeviceKey,
  getRememberMePreference,
  markAppUnlocked,
} from "@/lib/auth/security/deviceClient";
import { fetchAuthBootstrap, registerDeviceAfterLogin } from "@/lib/auth/security/webauthnClient";

export default function PlayerAuthBootstrap() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const deviceKey = getOrCreateDeviceKey();
      const data = await fetchAuthBootstrap();

      if (cancelled || !data.authenticated || !data.email) return;

      setEmail(data.email);
      markAppUnlocked(data.email);

      await registerDeviceAfterLogin(getRememberMePreference());

      if (!data.onboardingCompleted) {
        setShowOnboarding(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SecurityOnboardingWizard
        open={showOnboarding}
        email={email}
        onComplete={() => setShowOnboarding(false)}
      />
      <NewDeviceAlertModal />
    </>
  );
}
