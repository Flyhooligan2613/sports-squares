"use client";

import { teamAbbrev } from "@/lib/landing/useHeroFeaturedPool";
import type { CSSProperties } from "react";

function teamHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

interface HeroTeamLogoProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-9 h-9 text-[10px]",
  md: "w-11 h-11 text-xs",
  lg: "w-14 h-14 text-sm",
};

export default function HeroTeamLogo({ name, size = "md" }: HeroTeamLogoProps) {
  const hue = teamHue(name);
  const abbr = teamAbbrev(name);

  return (
    <span
      className={`hero-team-logo ${SIZES[size]}`}
      style={
        {
          "--team-hue": hue,
        } as CSSProperties
      }
      aria-hidden
    >
      {abbr}
    </span>
  );
}
