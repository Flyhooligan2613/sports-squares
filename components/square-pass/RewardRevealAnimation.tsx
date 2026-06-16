"use client";

import type { SquarePassGrantedReward } from "@/lib/platform/engines/squarePass";

interface RewardRevealAnimationProps {
  title: string;
  message: string;
  rewards: SquarePassGrantedReward[];
}

export default function RewardRevealAnimation({
  title,
  message,
  rewards,
}: RewardRevealAnimationProps) {
  return (
    <div
      className="rounded-xl border border-sb-purple/30 bg-gradient-to-br from-sb-purple/20 to-transparent p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
      role="status"
    >
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="text-sm text-sb-muted">{message}</p>
      <ul className="space-y-2">
        {rewards.map((reward, index) => (
          <li
            key={`${reward.type}-${reward.label}-${index}`}
            className="flex items-center gap-2 text-sm text-white/90"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sb-purple/30 text-xs">
              ✦
            </span>
            {reward.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
