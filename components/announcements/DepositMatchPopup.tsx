"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  formatFirstDepositMatchMax,
  isLiveTrialBannerEnabled,
  LIVE_TRIAL_BANNER,
} from "@/lib/platform/liveTrial";

const STATUS_API = "/api/square-wallet/deposit-match-status";

function isDepositPage(pathname: string): boolean {
  return pathname.startsWith("/my-games/wallet");
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export default function DepositMatchPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLiveTrialBannerEnabled()) return;
    if (isAdminPath(pathname) || isDepositPage(pathname)) return;

    try {
      if (sessionStorage.getItem(LIVE_TRIAL_BANNER.popupSessionDismissKey) === "1") return;
    } catch {
      /* ignore */
    }

    let cancelled = false;

    async function checkEligibility() {
      try {
        const res = await fetch(STATUS_API, { credentials: "include", cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401) return;
        if (!res.ok) return;
        const data = (await res.json()) as { eligible?: boolean };
        if (data.eligible) {
          setVisible(true);
        }
      } catch {
        /* ignore */
      }
    }

    const timer = window.setTimeout(() => {
      void checkEligibility();
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  function dismiss() {
    try {
      sessionStorage.setItem(LIVE_TRIAL_BANNER.popupSessionDismissKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  const matchMax = formatFirstDepositMatchMax();

  return (
    <div className="sb-promo-overlay sb-announcement-fade" role="dialog" aria-modal="true">
      <div className="sb-promo-modal sb-promo-scale-in sb-deposit-match-popup">
        <button
          type="button"
          onClick={dismiss}
          className="sb-promo-close"
          aria-label="Close deposit match offer"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <div className="sb-promo-media">
          <div className="sb-promo-image-fallback sb-deposit-match-popup-hero">
            <span className="sb-deposit-match-popup-icon" aria-hidden>
              <Sparkles className="w-8 h-8 text-sb-glow" strokeWidth={2} />
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/90 mb-3">
              Limited welcome offer
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              {LIVE_TRIAL_BANNER.title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Get a 100% match on your first deposit — up to {matchMax} in play-only bonus funds.
              Winnings from bonus play convert to real cash.
            </p>
          </div>
        </div>

        <div className="sb-promo-actions">
          <Button
            href={LIVE_TRIAL_BANNER.ctaHref}
            className="w-full min-h-[52px] text-base sb-live-trial-cta"
          >
            {LIVE_TRIAL_BANNER.ctaLabel}
          </Button>
          <button type="button" onClick={dismiss} className="sb-promo-decline">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
