"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LIVE_ARENA } from "@/lib/live-arena/routes";

interface LiveArenaExitButtonProps {
  fixed?: boolean;
}

export default function LiveArenaExitButton({ fixed = false }: LiveArenaExitButtonProps) {
  return (
    <Link
      href={LIVE_ARENA.exitHref}
      className={["la-exit-demo-btn", fixed ? "la-exit-demo-btn--fixed" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={LIVE_ARENA.exitLabel}
    >
      <ChevronLeft className="la-exit-demo-btn__icon" aria-hidden />
      <span className="la-exit-demo-btn__label">{LIVE_ARENA.exitLabel}</span>
    </Link>
  );
}
