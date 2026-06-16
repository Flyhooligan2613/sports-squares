"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { DropReward, DropBoxType } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { BOX_VISUALS, RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { SQUARE_DROP_NAME } from "@/lib/platform/ecosystem/squareDropBrand";

interface RewardShareCardProps {
  rewards: DropReward[];
  boxType: DropBoxType;
  dropId: string | null;
}

export default function RewardShareCard({ rewards, boxType, dropId }: RewardShareCardProps) {
  const [copied, setCopied] = useState(false);
  const best = [...rewards].sort((a, b) => {
    const order = ["immortal", "mythic", "legendary", "epic", "rare", "common"];
    return order.indexOf(a.rarity) - order.indexOf(b.rarity);
  })[0];

  if (!best) return null;

  const visual = BOX_VISUALS[boxType];
  const rarity = RARITY_COLORS[best.rarity];
  const shareText = `🎁 Just pulled a ${rarity.label} ${best.label} from my ${visual.label} on SquareBoards! #SquareBoards #SquareDrop`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://www.squareboards.pro";

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: `SquareBoards ${SQUARE_DROP_NAME}`,
        text: shareText,
        url: shareUrl,
      });
      return;
    }
    await copyLink();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openShare(platform: "x" | "facebook") {
    const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);
    const url =
      platform === "x"
        ? `https://twitter.com/intent/tweet?text=${encoded}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  return (
    <div className="wrd-share-card">
      <p className="text-xs uppercase tracking-wider text-sb-muted mb-2">Share your pull</p>
      <div
        className="rounded-xl border p-4 mb-3 text-left"
        style={{ borderColor: rarity.border, boxShadow: `0 0 24px ${rarity.glow}` }}
      >
        <p className="text-2xl mb-1">{best.icon}</p>
        <p className={`text-xs font-bold uppercase ${rarity.text}`}>{rarity.label}</p>
        <p className="text-white font-semibold">{best.label}</p>
        <p className="text-xs text-sb-muted mt-1">{visual.label}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button size="sm" onClick={() => void shareNative()}>
          {copied ? "Copied!" : "Share"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openShare("x")}>
          Share on X
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openShare("facebook")}>
          Facebook
        </Button>
      </div>
      {dropId ? <p className="text-[10px] text-sb-muted mt-2">Drop #{dropId.slice(0, 8)}</p> : null}
    </div>
  );
}
