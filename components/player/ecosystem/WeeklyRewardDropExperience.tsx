"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { DropReward, DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { BOX_VISUALS, RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import RewardShareCard from "@/components/player/ecosystem/RewardShareCard";

type Phase =
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
  const [phase, setPhase] = useState<Phase>("appear");
  const [rewards, setRewards] = useState<DropReward[]>([]);
  const [flippedIndex, setFlippedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const visual = BOX_VISUALS[boxType];

  const reset = useCallback(() => {
    setPhase("appear");
    setRewards([]);
    setFlippedIndex(-1);
    setError(null);
    setDropId(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
    if (open && replayOnly && replayRewards?.length) {
      setPhase("ready");
    }
  }, [open, reset, replayOnly, replayRewards]);

  useEffect(() => {
    if (!open || phase !== "appear" || replayOnly) return;
    const t1 = setTimeout(() => setPhase("rotate"), 600);
    const t2 = setTimeout(() => setPhase("pulse"), 1800);
    const t3 = setTimeout(() => setPhase("ready"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, phase]);

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

  async function handleOpen() {
    setPhase("shake");
    setError(null);
    await new Promise((r) => setTimeout(r, 900));
    setPhase("explode");

    if (replayOnly && replayRewards) {
      setRewards(replayRewards);
      setTimeout(() => setPhase("reveal"), 700);
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
      onOpened();
      setTimeout(() => setPhase("reveal"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open drop.");
      setPhase("ready");
    }
  }

  if (!open) return null;

  const showCube = ["appear", "rotate", "pulse", "ready", "shake", "explode"].includes(phase);
  const showConfetti = phase === "celebrate" || phase === "done";

  return (
    <div className="wrd-overlay" role="dialog" aria-modal="true" aria-label="Weekly Reward Drop">
      <div className="wrd-backdrop" />

      {showConfetti ? <Confetti /> : null}

      <div className="wrd-stage">
        <p className="wrd-eyebrow">🎁 Weekly Reward Drop</p>
        <h2 className="wrd-title">{visual.label}</h2>

        {error ? <p className="wrd-error">{error}</p> : null}

        {showCube ? (
          <div className="wrd-cube-scene">
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
            {phase === "explode" ? <div className="wrd-particles" /> : null}
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
              />
            ))}
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="wrd-done-actions">
            <p className="wrd-celebrate-text">
              {replayOnly ? "Animation replay" : "Rewards added to your Inventory!"}
            </p>
            {!replayOnly && rewards.some((r) => r.rarity === "legendary" || r.rarity === "mythic") ? (
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
}: {
  reward: DropReward;
  flipped: boolean;
  flying: boolean;
}) {
  const rarity = RARITY_COLORS[reward.rarity];
  return (
    <div
      className={[
        "wrd-reward-card",
        flipped ? "wrd-reward-card-flipped" : "",
        flying ? "wrd-reward-card-fly" : "",
        reward.special ? "wrd-reward-card-special" : "",
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

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="wrd-confetti" aria-hidden>
      {pieces.map((i) => (
        <span key={i} className="wrd-confetti-piece" style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}
