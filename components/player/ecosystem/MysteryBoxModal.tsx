"use client";

import { useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";

interface MysteryBoxModalProps {
  open: boolean;
  onClose: () => void;
  onOpened: () => void;
}

export default function MysteryBoxModal({ open, onClose, onOpened }: MysteryBoxModalProps) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "burst" | "done">("idle");
  const [rewards, setRewards] = useState<{ label?: string; amount?: number; type?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function openBox() {
    setPhase("spinning");
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));
    setPhase("burst");

    try {
      const res = await fetch("/api/ecosystem/mystery-box", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        rewards?: { label?: string; amount?: number; type?: string }[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not open box.");
      setRewards(data.rewards ?? []);
      setPhase("done");
      onOpened();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open box.");
      setPhase("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <LandingGlassCard className="w-full max-w-md p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-3">Weekly Mystery Box</p>

        {phase === "idle" ? (
          <>
            <div className="mx-auto w-28 h-28 rounded-2xl bg-gradient-to-br from-sb-purple to-emerald-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2">Your reward is ready</h2>
            <p className="text-sm text-sb-muted mb-6">$500+ weekly gameplay unlocked this box.</p>
            {error ? <p className="text-sm text-red-300 mb-4">{error}</p> : null}
            <Button className="w-full mb-3" onClick={() => void openBox()}>
              Open Mystery Box
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Later
            </Button>
          </>
        ) : null}

        {phase === "spinning" ? (
          <div className="py-10">
            <div className="mx-auto w-32 h-32 rounded-2xl bg-gradient-to-br from-sb-purple to-emerald-500 animate-spin mb-4" />
            <p className="text-white font-medium">Unlocking rewards…</p>
          </div>
        ) : null}

        {phase === "burst" || phase === "done" ? (
          <div className="py-4 space-y-3">
            <h2 className="text-2xl font-bold text-white">Rewards unlocked!</h2>
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200"
              >
                {reward.label ?? reward.type} · {reward.amount}
              </div>
            ))}
            <Button className="w-full mt-4" onClick={onClose}>
              Continue
            </Button>
          </div>
        ) : null}
      </LandingGlassCard>
    </div>
  );
}
