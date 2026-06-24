"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";
import RewardRevealAnimation from "./RewardRevealAnimation";
import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass";
import { formatUserError } from "@/lib/errors/formatUserError";

interface PromoCodeRedemptionProps {
  className?: string;
}

export default function PromoCodeRedemption({ className = "" }: PromoCodeRedemptionProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{
    title: string;
    message: string;
    rewards: SquarePassGrantedReward[];
  } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  async function handleRedeem() {
    setError(null);
    setCelebration(null);
    setLoading(true);

    try {
      const res = await fetch("/api/square-pass/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Redemption failed.");

      setCelebration(json.celebration);
      setConfettiTrigger((n) => n + 1);
      setCode("");
    } catch (err) {
      setError(formatUserError(err, "redeem"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LandingGlassCard className={`p-6 space-y-4 relative overflow-hidden ${className}`}>
      <ConfettiCelebration trigger={confettiTrigger} tier="large" />

      <div>
        <p className="text-xs uppercase tracking-wider text-sb-muted">SquarePass™</p>
        <h3 className="text-xl font-bold text-white">Unlock an Exclusive Opportunity</h3>
        <p className="text-sm text-sb-muted mt-1">
          Enter your access code to claim rewards — not discounts, exclusive platform opportunities.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white font-mono uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sb-purple/50"
          aria-label="Promo code"
        />
        <Button onClick={() => void handleRedeem()} disabled={loading || !code.trim()}>
          {loading ? "Unlocking…" : "Unlock"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {celebration ? (
        <RewardRevealAnimation
          title={celebration.title}
          message={celebration.message}
          rewards={celebration.rewards}
        />
      ) : null}
    </LandingGlassCard>
  );
}
