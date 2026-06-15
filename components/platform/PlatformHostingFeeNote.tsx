"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { formatTierCents } from "@/lib/platform/core/entryTiers";
import {
  calcPlatformHostingFeeCents,
  calcPrizePoolCreditCents,
  formatHostingFeePercent,
  resolvePlatformHostingFeePercent,
  type PlatformProductType,
} from "@/lib/platform/core/platformFeeSchedule";

interface PlatformHostingFeeNoteProps {
  entryTierCents: number;
  grossCents: number;
  productType: PlatformProductType;
  className?: string;
  compact?: boolean;
}

export default function PlatformHostingFeeNote({
  entryTierCents,
  grossCents,
  productType,
  className = "",
  compact = false,
}: PlatformHostingFeeNoteProps) {
  const feePercent = resolvePlatformHostingFeePercent(entryTierCents, productType);
  const feeCents = calcPlatformHostingFeeCents(grossCents, entryTierCents, productType);
  const prizeCents = calcPrizePoolCreditCents(grossCents, entryTierCents, productType);

  if (compact) {
    return (
      <p className={`text-xs text-sb-muted ${className}`}>
        {formatHostingFeePercent(entryTierCents)} platform hosting ·{" "}
        {100 - feePercent}% to prize pool ·{" "}
        <Link href="/transparency#hosting-fees" className="text-sb-glow hover:underline">
          Fixed rates
        </Link>
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-sb-muted space-y-1.5 ${className}`}
    >
      <p className="flex items-center gap-1.5 text-white/90 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
        Fixed hosting fee — not editable by anyone
      </p>
      <p>
        {formatTierCents(grossCents)} entry · {formatHostingFeePercent(entryTierCents)} (
        {formatTierCents(feeCents)}) platform hosting · {formatTierCents(prizeCents)} to prize
        pool
      </p>
      <p>
        {productType === "squares"
          ? "Lottery-style squares among participants — not a wager against SquareBoards."
          : "Global skill competition — entry fees fund tier prize pools, not house odds."}{" "}
        <Link href="/transparency#hosting-fees" className="text-sb-glow hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
