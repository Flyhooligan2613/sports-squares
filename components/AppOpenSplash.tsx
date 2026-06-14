"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { isPwaDisplayMode } from "@/lib/pwa/isPwaDisplayMode";

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
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (shouldSkipSplash(pathname)) {
      document.documentElement.classList.remove("sb-splash-pending");
      setPhase("done");
      return;
    }

    const isPwa = isPwaDisplayMode();
    let showSplash = isPwa;

    if (!isPwa) {
      try {
        showSplash = !sessionStorage.getItem(APP_OPEN_SPLASH_KEY);
      } catch {
        document.documentElement.classList.remove("sb-splash-pending");
        setPhase("done");
        return;
      }
    }

    if (!showSplash) {
      document.documentElement.classList.remove("sb-splash-pending");
      setPhase("done");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      if (!isPwa) {
        try {
          sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
        } catch {
          /* ignore */
        }
      }
      document.documentElement.classList.remove("sb-splash-pending");
      setPhase("done");
      return;
    }

    setPhase("enter");
    document.documentElement.classList.add("sb-splash-pending");

    const exitTimer = window.setTimeout(() => setPhase("exit"), SHOW_MS);
    const doneTimer = window.setTimeout(() => {
      if (!isPwa) {
        try {
          sessionStorage.setItem(APP_OPEN_SPLASH_KEY, "1");
        } catch {
          /* ignore */
        }
      }
      document.documentElement.classList.remove("sb-splash-pending");
      setPhase("done");
    }, SHOW_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.documentElement.classList.remove("sb-splash-pending");
    };
  }, [pathname]);

  if (phase === "hidden" || phase === "done") return null;

  return (
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
  );
}
