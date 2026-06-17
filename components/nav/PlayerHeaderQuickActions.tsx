"use client";

import Link from "next/link";
import { IdCard } from "lucide-react";
import { PLAYER_TERMS } from "@/lib/platform/language";

const iconLinkClass =
  "nav-header-icon inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-sb-muted hover:text-white hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40";

interface PlayerHeaderQuickActionsProps {
  className?: string;
  /** Competitor Card hub — customization, bio, emojis, settings */
  competitorCardHref?: string;
}

export default function PlayerHeaderQuickActions({
  className = "",
  competitorCardHref = "/my-games/profile",
}: PlayerHeaderQuickActionsProps) {
  return (
    <div className={["flex items-center gap-0.5 sm:gap-1", className].filter(Boolean).join(" ")}>
      <Link
        href={competitorCardHref}
        className={iconLinkClass}
        aria-label={PLAYER_TERMS.competitorCard}
        title={PLAYER_TERMS.competitorCard}
      >
        <IdCard className="w-5 h-5" strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}
