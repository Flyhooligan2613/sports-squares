"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const stored = sessionStorage.getItem("pwa-install-dismissed");
    if (stored) setDismissed(true);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  if (installed || dismissed || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-xl shadow-black/40">
      <p className="text-slate-200 text-sm font-semibold mb-1">
        Install Sports Squares
      </p>
      <p className="text-slate-500 text-xs mb-3">
        Add to your home screen for quick access to your pools.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
