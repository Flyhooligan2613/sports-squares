"use client";

import { useEffect, useState } from "react";
import type { PoolHighlightSquare } from "@/lib/highlight/types";
import {
  HIGHLIGHT_INTRO_STORAGE_KEY,
  HIGHLIGHT_SHORT_TOOLTIP,
  highlightRewardLabel,
} from "@/lib/highlight/copy";

interface HighlightSquareLegendProps {
  highlights: PoolHighlightSquare[];
  className?: string;
}

export default function HighlightSquareLegend({
  highlights,
  className = "",
}: HighlightSquareLegendProps) {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (highlights.length === 0) return;
    try {
      const seen = localStorage.getItem(HIGHLIGHT_INTRO_STORAGE_KEY);
      if (!seen) setShowIntro(true);
    } catch {
      setShowIntro(true);
    }
  }, [highlights.length]);

  if (highlights.length === 0) return null;

  const activated = highlights.filter((h) => h.activatedAt).length;
  const pending = highlights.length - activated;

  function dismissIntro() {
    setShowIntro(false);
    try {
      localStorage.setItem(HIGHLIGHT_INTRO_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <div className={`highlight-legend ${className}`.trim()}>
      {showIntro ? (
        <div className="highlight-intro-banner mb-3 highlight-intro-banner-flash">
          <div className="flex items-start gap-3">
            <span className="highlight-intro-popup-star text-lg shrink-0" aria-hidden>
              ⭐
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-200">
                Highlight Mystery Box activated
              </p>
              <p className="text-xs text-sb-muted mt-0.5 leading-relaxed">
                {HIGHLIGHT_SHORT_TOOLTIP} Win a checkpoint on ⭐ for {highlightRewardLabel()}{" "}
                on top of your payout.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissIntro}
              className="text-xs text-sb-muted hover:text-white shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sb-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="highlight-legend-star" aria-hidden>
            ⭐
          </span>
          <span className="text-amber-200/90 font-medium">Highlight Square</span>
        </span>
        <span>
          {pending} mystery · {activated} activated
        </span>
      </div>
    </div>
  );
}
