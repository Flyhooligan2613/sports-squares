"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SignupWelcomeModal from "@/components/auth/SignupWelcomeModal";
import { getOrCreateDeviceKey } from "@/lib/auth/security/deviceClient";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";
import {
  consumeSignupOpenPending,
  markDeviceHasAuthenticated,
  OPEN_SIGNUP_EVENT,
  shouldShowSignupPrompt,
} from "@/lib/auth/signupPrompt";

function shouldSkipRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/my-games/login") ||
    pathname.startsWith("/my-games/forgot-password") ||
    pathname.startsWith("/my-games/reset-password")
  );
}

function SignupWelcomeGateInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const evaluatedRef = useRef(false);
  const referralCode = searchParams.get("ref") ?? "";

  useEffect(() => {
    function onOpenSignup() {
      setOpen(true);
    }
    window.addEventListener(OPEN_SIGNUP_EVENT, onOpenSignup);
    return () => window.removeEventListener(OPEN_SIGNUP_EVENT, onOpenSignup);
  }, []);

  useEffect(() => {
    if (consumeSignupOpenPending() || searchParams.get("signup") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (evaluatedRef.current) return;
    if (shouldSkipRoute(pathname)) return;

    evaluatedRef.current = true;
    let cancelled = false;

    async function evaluate() {
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      if (cancelled) return;

      const deviceKey = getOrCreateDeviceKey();

      let authenticated = false;
      try {
        const bootstrap = await fetchAuthBootstrap();
        if (cancelled) return;

        if (bootstrap.authenticated && bootstrap.email) {
          markDeviceHasAuthenticated(deviceKey);
          authenticated = true;
        }
      } catch {
        /* show signup for guests if bootstrap fails */
      }

      if (cancelled || authenticated) return;

      if (shouldShowSignupPrompt(deviceKey, false)) {
        setOpen(true);
      }
    }

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <SignupWelcomeModal
      open={open}
      onClose={() => setOpen(false)}
      referralCode={referralCode}
    />
  );
}

export default function SignupWelcomeGate() {
  return (
    <Suspense fallback={null}>
      <SignupWelcomeGateInner />
    </Suspense>
  );
}
