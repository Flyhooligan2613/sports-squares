"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { DropReward, DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { BOX_VISUALS, RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import {
  SQUARE_DROP_NAME,
  SQUARE_DROP_READY,
} from "@/lib/platform/ecosystem/squareDropBrand";
import RewardShareCard from "@/components/player/ecosystem/RewardShareCard";

type Phase =
  | "intro"
  | "logo"
  | "tiles"
  | "form"
  | "appear"
  | "rotate"
  | "pulse"
  | "ready"
  | "shake"
  | "explode"
  | "reveal"
  | "flip"
  | "inventory"
  | "celebrate"
  | "done";

interface WeeklyRewardDropExperienceProps {
  open: boolean;
  boxType?: DropBoxType;
  replayRewards?: DropReward[];
  replayOnly?: boolean;
  onClose: () => void;
  onOpened: () => void;
}

export default function WeeklyRewardDropExperience({
  open,
  boxType = "gold",
  replayRewards,
  replayOnly = false,
  onClose,
  onOpened,
}: WeeklyRewardDropExperienceProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [rewards, setRewards] = useState<DropReward[]>([]);
  const [flippedIndex, setFlippedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const openingRef = useRef(false);
  const pendingRefreshRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;
  const visual = BOX_VISUALS[boxType];

  const reset = useCallback(() => {
    setPhase(replayOnly ? "ready" : "intro");
    setRewards([]);
    setFlippedIndex(-1);
    setError(null);
    setDropId(null);
    openingRef.current = false;
    pendingRefreshRef.current = false;
  }, [replayOnly]);

  useEffect(() => {
    if (!open) reset();
    if (open && replayOnly && replayRewards?.length) {
      setPhase("ready");
    }
  }, [open, reset, replayOnly, replayRewards]);

  useEffect(() => {
    if (!open || replayOnly) return;
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("logo"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "logo") {
      const t = setTimeout(() => setPhase("tiles"), 1400);
      return () => clearTimeout(t);
    }
    if (phase === "tiles") {
      const t = setTimeout(() => setPhase("form"), 1600);
      return () => clearTimeout(t);
    }
    if (phase === "form") {
      const t = setTimeout(() => setPhase("appear"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "appear") {
      const t1 = setTimeout(() => setPhase("rotate"), 500);
      return () => clearTimeout(t1);
    }
    if (phase === "rotate") {
      const t = setTimeout(() => setPhase("pulse"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "pulse") {
      const t = setTimeout(() => setPhase("ready"), 1000);
      return () => clearTimeout(t);
    }
  }, [open, phase, replayOnly]);

  useEffect(() => {
    if (phase !== "reveal" || rewards.length === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setFlippedIndex(i);
      i += 1;
      if (i >= rewards.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("inventory"), 800);
      }
    }, 450);
    return () => clearInterval(interval);
  }, [phase, rewards.length]);

  useEffect(() => {
    if (phase === "inventory") {
      const t = setTimeout(() => setPhase("celebrate"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "celebrate") {
      const t = setTimeout(() => setPhase("done"), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "done" || !pendingRefreshRef.current) return;
    pendingRefreshRef.current = false;
    onOpenedRef.current();
  }, [phase]);

  async function handleOpen() {
    if (openingRef.current) return;
    openingRef.current = true;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([40, 30, 80]);
    }

    setPhase("shake");
    setError(null);
    await new Promise((r) => setTimeout(r, 900));
    setPhase("explode");

    if (replayOnly && replayRewards) {
      setRewards(replayRewards);
      setTimeout(() => setPhase("reveal"), 700);
      openingRef.current = false;
      return;
    }

    try {
      const res = await fetch("/api/ecosystem/weekly-drop", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        rewards?: DropReward[];
        drop?: { id: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not open drop.");

      setRewards(data.rewards ?? []);
      setDropId(data.drop?.id ?? null);
      pendingRefreshRef.current = true;
      setTimeout(() => setPhase("reveal"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open drop.");
      setPhase("ready");
      openingRef.current = false;
    }
  }

  if (!open) return null;

  const showIntro = ["intro", "logo", "tiles", "form"].includes(phase);
  const showCube = ["appear", "rotate", "pulse", "ready", "shake", "explode"].includes(phase);
  const showConfetti = phase === "celebrate" || phase === "done";
  const isPremiumPull = rewards.some(
    (r) => r.rarity === "legendary" || r.rarity === "mythic" || r.rarity === "immortal"
  );

  return (
    <div className="wrd-overlay" role="dialog" aria-modal="true" aria-label={SQUARE_DROP_NAME}>
      <div className="wrd-backdrop" />
      <FloatingParticles active={showIntro || showCube} />

      {showConfetti ? <Confetti premium={isPremiumPull} /> : null}
      {phase === "celebrate" && isPremiumPull ? <Fireworks /> : null}

      <div className="wrd-stage">
        {!showIntro ? (
          <>
            <p className="wrd-eyebrow">🎁 {SQUARE_DROP_READY}</p>
            <h2 className="wrd-title">{visual.label}</h2>
          </>
        ) : null}

        {error ? <p className="wrd-error">{error}</p> : null}

        {showIntro ? (
          <div className="wrd-intro-scene">
            {phase === "intro" ? <div className="wrd-intro-fade" /> : null}
            {(phase === "logo" || phase === "tiles" || phase === "form") ? (
              <div className={`wrd-logo-mark wrd-logo-${phase}`}>
                <div className="wrd-logo-grid">
                  <span className="wrd-logo-tile wrd-logo-tile-1" />
                  <span className="wrd-logo-tile wrd-logo-tile-2" />
                  <span className="wrd-logo-tile wrd-logo-tile-3" />
                  <span className="wrd-logo-tile wrd-logo-tile-4" />
                </div>
                <p className="wrd-logo-text">{SQUARE_DROP_NAME}</p>
                <div className="wrd-logo-electricity" aria-hidden />
              </div>
            ) : null}
          </div>
        ) : null}

        {showCube ? (
          <div className={`wrd-cube-scene ${phase === "form" ? "wrd-cube-scene-enter" : ""}`}>
            <div
              className={[
                "wrd-cube",
                `wrd-cube-${phase}`,
                `wrd-cube-${boxType}`,
              ].join(" ")}
              style={{ "--wrd-glow": visual.glow } as React.CSSProperties}
            >
              <div className="wrd-cube-face wrd-cube-front">{visual.emoji}</div>
              <div className="wrd-cube-face wrd-cube-back">SB</div>
              <div className="wrd-cube-face wrd-cube-right">⭐</div>
              <div className="wrd-cube-face wrd-cube-left">🏆</div>
              <div className="wrd-cube-face wrd-cube-top">💎</div>
              <div className="wrd-cube-face wrd-cube-bottom">🎲</div>
            </div>
            {phase === "pulse" || phase === "ready" ? <div className="wrd-energy-ring" /> : null}
            {phase === "explode" ? (
              <>
                <div className="wrd-particles" />
                <div className="wrd-smoke" />
              </>
            ) : null}
          </div>
        ) : null}

        {phase === "ready" ? (
          <Button className="wrd-open-btn player-btn-glow" onClick={() => void handleOpen()}>
            OPEN
          </Button>
        ) : null}

        {phase === "shake" ? <p className="wrd-status">Unlocking…</p> : null}

        {["reveal", "flip", "inventory", "celebrate", "done"].includes(phase) ? (
          <div className="wrd-rewards-grid">
            {rewards.map((reward, index) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                flipped={flippedIndex >= index}
                flying={phase === "inventory" || phase === "celebrate" || phase === "done"}
                spotlight={phase === "reveal" && flippedIndex === index}
              />
            ))}
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="wrd-done-actions">
            <p className="wrd-celebrate-text">
              {replayOnly ? "Animation replay" : "Rewards added to your Inventory!"}
            </p>
            {!replayOnly && isPremiumPull ? (
              <RewardShareCard rewards={rewards} boxType={boxType} dropId={dropId} />
            ) : null}
            <Button className="w-full max-w-xs mx-auto" onClick={onClose}>
              Continue
            </Button>
          </div>
        ) : null}

        {phase === "ready" ? (
          <button type="button" className="wrd-later" onClick={onClose}>
            Open later
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RewardCard({
  reward,
  flipped,
  flying,
  spotlight,
}: {
  reward: DropReward;
  flipped: boolean;
  flying: boolean;
  spotlight?: boolean;
}) {
  const rarity = RARITY_COLORS[reward.rarity];
  return (
    <div
      className={[
        "wrd-reward-card",
        flipped ? "wrd-reward-card-flipped" : "",
        flying ? "wrd-reward-card-fly" : "",
        reward.special ? "wrd-reward-card-special" : "",
        spotlight ? "wrd-reward-card-spotlight" : "",
      ].join(" ")}
      style={{ "--rarity-glow": rarity.glow, borderColor: rarity.border } as React.CSSProperties}
    >
      <div className="wrd-reward-card-inner">
        <div className="wrd-reward-card-back">?</div>
        <div className="wrd-reward-card-front">
          <span className="wrd-reward-icon">{reward.icon}</span>
          <p className={`wrd-reward-rarity ${rarity.text}`}>{rarity.label}</p>
          <p className="wrd-reward-label">{reward.label}</p>
          <p className="wrd-reward-value">
            {reward.valueCents
              ? `$${(reward.valueCents / 100).toFixed(0)}`
              : reward.amount
                ? `+${reward.amount}`
                : "Unlocked"}
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingParticles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="wrd-float-particles" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className="wrd-float-particle" style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Confetti({ premium }: { premium: boolean }) {
  const count = premium ? 60 : 40;
  const pieces = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="wrd-confetti" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className={premium ? "wrd-confetti-piece wrd-confetti-premium" : "wrd-confetti-piece"}
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  return (
    <div className="wrd-fireworks" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="wrd-firework-burst" style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}
