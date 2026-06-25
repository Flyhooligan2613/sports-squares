"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { AliveExperienceBridge } from "@/lib/platform/alive/experienceIntegration";
import MicroCelebration from "@/components/alive/MicroCelebration";
import { WALLET_COPY } from "@/lib/platform/language/walletLanguage";
import WalletTrustSignals from "./WalletTrustSignals";

export default function DepositSuccessAnimation() {
  const [visible, setVisible] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      setVisible(true);
      setCelebrationTrigger((n) => n + 1);
      AliveExperienceBridge.hooks.onFirstDeposit(0);
      const url = new URL(window.location.href);
      url.searchParams.delete("deposit");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-success-title"
    >
      <MicroCelebration trigger={celebrationTrigger} label={WALLET_COPY.depositSuccess} />
      <LandingGlassCard
        glow
        className="max-w-sm w-full p-8 text-center border border-emerald-400/30 animate-in fade-in zoom-in duration-300"
      >
        <p className="text-5xl mb-3" aria-hidden>
          ✨
        </p>
        <h2 id="deposit-success-title" className="text-xl font-bold text-white mb-2">
          {WALLET_COPY.depositSuccess}
        </h2>
        <p className="text-sm text-sb-muted mb-6">{WALLET_COPY.depositSuccessBody}</p>
        <WalletTrustSignals className="mb-6" />
        <Button onClick={() => setVisible(false)} className="w-full min-h-[44px]">
          Continue
        </Button>
      </LandingGlassCard>
    </div>
  );
}
