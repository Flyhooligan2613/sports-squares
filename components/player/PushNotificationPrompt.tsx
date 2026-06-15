"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { subscribeToPushNotifications } from "@/lib/push/clientSubscribe";
import {
  isPushPromptSupported,
  markPushPromptComplete,
  markPushPromptSeenThisSession,
  shouldShowPushPrompt,
} from "@/lib/push/promptState";
import { notifySplashComplete } from "@/lib/auth/signupPrompt";

type EnablePhase = "idle" | "permission" | "syncing";

export default function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<EnablePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const enablingRef = useRef(false);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isPushPromptSupported()) return;

    setSupported(true);

    if (!shouldShowPushPrompt()) return;
    if (scheduledRef.current) return;
    scheduledRef.current = true;

    const timer = window.setTimeout(() => {
      if (!shouldShowPushPrompt()) return;
      markPushPromptSeenThisSession();
      setVisible(true);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    markPushPromptSeenThisSession();
    setVisible(false);
    setPhase("idle");
    setError(null);
  }

  async function enable() {
    if (enablingRef.current) return;
    enablingRef.current = true;
    setPhase("permission");
    setError(null);

    document.documentElement.classList.remove("sb-splash-pending");
    notifySplashComplete();

    setPhase("syncing");
    const result = await subscribeToPushNotifications();

    enablingRef.current = false;
    setPhase("idle");

    if (!result.ok) {
      setError(result.error ?? "Could not enable notifications.");
      return;
    }

    markPushPromptComplete();
    setVisible(false);
  }

  const loading = phase !== "idle";
  const loadingLabel =
    phase === "permission" ? "Waiting for permission…" : "Syncing alerts…";

  if (!supported || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="rounded-2xl border border-emerald-500/30 bg-sb-surface/95 backdrop-blur-xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <p className="text-white font-semibold text-sm">Game day alerts</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-sb-muted hover:text-white"
            aria-label="Dismiss"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-sb-muted leading-relaxed mb-4">
          Get ESPN-style notifications when picks open, games go live, and you win — even when
          SquareBoards is closed. On iPhone, add SquareBoards to your Home Screen first.
        </p>
        {error ? <p className="text-xs text-red-400 mb-3">{error}</p> : null}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void enable()} disabled={loading} className="flex-1">
            {loading ? loadingLabel : "Enable notifications"}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss} className="shrink-0" disabled={loading}>
            <BellOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
