"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HIGHLIGHT_INTRO_STORAGE_KEY,
  HIGHLIGHT_POPUP_HEADLINE,
  HIGHLIGHT_POPUP_TAGLINE,
  HIGHLIGHT_PLACEMENT_EXPLAINER,
} from "@/lib/highlight/copy";

interface HighlightSquareIntroPopupProps {
  learnHref?: string;
  /** Show even if user dismissed before (e.g. per pool visit). Default: once globally. */
  storageKey?: string;
  className?: string;
}

export default function HighlightSquareIntroPopup({
  learnHref = "/learn/how-to-play",
  storageKey = HIGHLIGHT_INTRO_STORAGE_KEY,
  className = "",
}: HighlightSquareIntroPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      /* show popup */
    }
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div
      className={["highlight-intro-popup-root", className].filter(Boolean).join(" ")}
      role="dialog"
      aria-labelledby="highlight-intro-title"
      aria-live="polite"
    >
      <div className="highlight-intro-popup-card highlight-intro-popup-enter">
        <div className="highlight-intro-popup-icon-wrap" aria-hidden>
          <span className="highlight-intro-popup-star">⭐</span>
        </div>
        <div className="highlight-intro-popup-body">
          <p id="highlight-intro-title" className="highlight-intro-popup-headline">
            {HIGHLIGHT_POPUP_HEADLINE}
          </p>
          <p className="highlight-intro-popup-tagline">{HIGHLIGHT_POPUP_TAGLINE}</p>
          <p className="highlight-intro-popup-detail">{HIGHLIGHT_PLACEMENT_EXPLAINER[0]}</p>
        </div>
        <div className="highlight-intro-popup-actions">
          <button type="button" onClick={dismiss} className="highlight-intro-popup-btn">
            Got it
          </button>
          <Link href={learnHref} onClick={dismiss} className="highlight-intro-popup-link">
            How it works →
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="highlight-intro-popup-close"
          aria-label="Dismiss Highlight Squares intro"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
