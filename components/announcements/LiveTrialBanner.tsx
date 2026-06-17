"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LIVE_TRIAL_BANNER, isLiveTrialBannerEnabled } from "@/lib/platform/liveTrial";

export default function LiveTrialBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLiveTrialBannerEnabled()) return;
    try {
      if (localStorage.getItem(LIVE_TRIAL_BANNER.dismissStorageKey) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(LIVE_TRIAL_BANNER.dismissStorageKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="sb-live-trial-banner sb-announcement-enter" role="status">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center gap-3">
        <span className="sb-live-trial-pulse hidden sm:flex shrink-0" aria-hidden>
          <Sparkles className="w-4 h-4 text-sb-glow" strokeWidth={2.25} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-[0.9375rem] font-bold text-white leading-tight">
            {LIVE_TRIAL_BANNER.title}
          </p>
          <p className="text-[11px] sm:text-xs text-emerald-200/85 leading-snug mt-0.5">
            {LIVE_TRIAL_BANNER.subtitle}
          </p>
        </div>
        <Button
          href={LIVE_TRIAL_BANNER.ctaHref}
          variant="secondary"
          className="shrink-0 text-xs sm:text-sm min-h-9 px-3 sm:px-4 sb-live-trial-cta"
        >
          {LIVE_TRIAL_BANNER.ctaLabel}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          className="sb-announcement-dismiss shrink-0"
          aria-label="Dismiss deposit match banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
