"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

export default function DepositSuccessAnimation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      setVisible(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("deposit");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <LandingGlassCard glow className="max-w-sm w-full p-8 text-center border border-emerald-400/30 animate-in fade-in zoom-in duration-300">
        <p className="text-5xl mb-3" aria-hidden>
          ✨
        </p>
        <h2 className="text-xl font-bold text-white mb-2">Funds Added</h2>
        <p className="text-sm text-sb-muted mb-6">
          Your SquareWallet™ is funded — you&apos;re ready to join the next contest.
        </p>
        <Button onClick={() => setVisible(false)} className="w-full">
          Continue
        </Button>
      </LandingGlassCard>
    </div>
  );
}
