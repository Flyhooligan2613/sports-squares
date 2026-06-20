"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import SignupWelcomeGate from "@/components/auth/SignupWelcomeGate";
import { notifySplashComplete } from "@/lib/auth/signupPrompt";

export const APP_OPEN_SPLASH_KEY = "sb-app-open-splash-seen";

const SHOW_MS = 2100;
const EXIT_MS = 480;

function shouldSkipSplash(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

type SplashPhase = "hidden" | "enter" | "exit" | "done";

export default function AppOpenSplash() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<SplashPhase>("hidden");
  const [splashReady, setSplashReady] = useState(false);
  const startedRef = useRef(false);
  const phaseRef = useRef<SplashPhase>("hidden");
  const splashStartedAtRef = useRef(0);

  function finishSplash() {
    document.documentElement.classList.remove("sb-splash-pending");
    if (typeof document !== "undefined") {
      document.body.style.removeProperty("overflow");
    }
    notifySplashComplete();
    setPhase("done");
    phaseRef.current = "done";
    setSplashReady(true);
  }

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (shouldSkipSplash(pathname)) {
      finishSplash();
      return;
    }

    let showSplash = false;
    try {
      showSplash = !sessionStorage.getItem(APP_OPEN_SPLASH_KEY);
    } catch {
      finishSplash();
      return;
    }

    if (!showSplash) {
      finishSplash();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      try {
        sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      finishSplash();
      return;
    }

    setPhase("enter");
    phaseRef.current = "enter";
    splashStartedAtRef.current = Date.now();
    document.documentElement.classList.add("sb-splash-pending");

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
      phaseRef.current = "exit";
    }, SHOW_MS);
    const doneTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      document.documentElement.classList.remove("sb-splash-pending");
      document.body.style.removeProperty("overflow");
      finishSplash();
    }, SHOW_MS + EXIT_MS);

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const elapsed = Date.now() - splashStartedAtRef.current;
      const overdue = elapsed > SHOW_MS + EXIT_MS + 800;
      if (!overdue) return;
      if (phaseRef.current === "hidden" || phaseRef.current === "done") return;
      try {
        sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      finishSplash();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("sb-splash-pending");
      document.body.style.removeProperty("overflow");
      // If navigation interrupts the splash timers, never leave the overlay stuck.
      if (phaseRef.current === "enter" || phaseRef.current === "exit") {
        try {
          sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
        } catch {
          /* ignore */
        }
        phaseRef.current = "done";
        setPhase("done");
        setSplashReady(true);
        notifySplashComplete();
      }
    };
  }, [pathname]);

  return (
    <>
      {phase === "enter" || phase === "exit" ? (
        <div
          className={[
            "app-open-splash",
            phase === "enter" ? "app-open-splash-enter" : "",
            phase === "exit" ? "app-open-splash-exit" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
          role="presentation"
        >
          <div className="app-open-splash-glow" aria-hidden />
          <div className="app-open-splash-grid" aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className="app-open-splash-cell"
                style={{ animationDelay: `${index * 90}ms` }}
              />
            ))}
          </div>
          <div className="app-open-splash-brand">
            <Logo href={false} className="app-open-splash-logo text-xl sm:text-2xl" />
            <p className="app-open-splash-tagline">Pick your squares. Watch the game.</p>
          </div>
        </div>
      ) : null}

      {splashReady ? (
        <Suspense fallback={null}>
          <SignupWelcomeGate />
        </Suspense>
      ) : null}
    </>
  );
}
