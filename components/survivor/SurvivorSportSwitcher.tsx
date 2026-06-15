"use client";

import Link from "next/link";
import { SURVIVOR_ENABLED_SPORTS } from "@/lib/survivor/sports";
import type { SurvivorSport } from "@/lib/survivor/types";
import { survivorPath } from "@/lib/survivor/routes";

interface SurvivorSportSwitcherProps {
  activeSport: SurvivorSport;
  /** Path segment after /survivor/ e.g. "week", "leagues", "" for hub */
  basePath?: string;
  className?: string;
}

function sportHref(basePath: string, sport: SurvivorSport): string {
  const path = basePath ? survivorPath(basePath) : survivorPath();
  return `${path}?sport=${sport}`;
}

export default function SurvivorSportSwitcher({
  activeSport,
  basePath = "",
  className = "",
}: SurvivorSportSwitcherProps) {
  return (
    <div
      className={`inline-flex rounded-full border border-white/10 bg-white/5 p-1 gap-1 ${className}`}
      role="tablist"
      aria-label="Survivor sport"
    >
      {SURVIVOR_ENABLED_SPORTS.map((sport) => {
        const active = sport.id === activeSport;
        return (
          <Link
            key={sport.id}
            href={sportHref(basePath, sport.id)}
            role="tab"
            aria-selected={active}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                : "text-sb-muted hover:text-white"
            }`}
          >
            <span aria-hidden>{sport.emoji}</span> {sport.label}
          </Link>
        );
      })}
    </div>
  );
}
