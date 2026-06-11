"use client";

import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_KEY = "sb-visit-count";
const DISMISS_KEY = "pwa-install-dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));
    const isSecondVisit = visits >= 2;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    function maybeShow() {
      setVisible(true);
    }

    let scrollShown = false;
    function onScroll() {
      if (scrollShown) return;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const ratio = window.scrollY / maxScroll;
      if (ratio >= 0.5) {
        scrollShown = true;
        maybeShow();
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("scroll", onScroll, { passive: true });

    const timer = window.setTimeout(maybeShow, 30000);

    if (isSecondVisit) {
      maybeShow();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  if (installed || !visible || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 sb-card border-indigo-500/30 p-4 shadow-2xl shadow-black/50 landing-fade-up">
      <p className="text-slate-100 text-sm font-semibold mb-1">
        Install {BRAND_NAME}
      </p>
      <p className="text-slate-500 text-xs mb-3 leading-relaxed">
        Add to your home screen for one-tap access to your pools.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="sb-btn-primary flex-1 min-h-[44px] py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors min-h-[44px]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
