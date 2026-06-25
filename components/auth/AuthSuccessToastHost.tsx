"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  AUTH_SUCCESS_EVENT,
  consumeAuthSuccessFromUrl,
  resolveAuthSuccessCopy,
  type AuthSuccessDetail,
} from "@/lib/auth/authSuccessFeedback";

const DISMISS_MS = 5200;

export default function AuthSuccessToastHost() {
  const [toast, setToast] = useState<AuthSuccessDetail | null>(null);

  useEffect(() => {
    consumeAuthSuccessFromUrl();

    function onSuccess(event: Event) {
      const detail = (event as CustomEvent<AuthSuccessDetail>).detail;
      if (!detail?.kind) return;
      setToast(detail);
    }

    window.addEventListener(AUTH_SUCCESS_EVENT, onSuccess);
    return () => window.removeEventListener(AUTH_SUCCESS_EVENT, onSuccess);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const copy = resolveAuthSuccessCopy(toast.kind, toast.message);

  return (
    <div
      className="auth-success-toast-host"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="auth-success-toast sb-announcement-enter">
        <span className="auth-success-toast-emoji" aria-hidden>
          {copy.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{copy.title}</p>
          <p className="text-sb-muted text-xs leading-relaxed mt-0.5">{copy.body}</p>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="auth-success-toast-dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
