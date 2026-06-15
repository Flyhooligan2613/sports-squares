"use client";

import HubSectionLink from "@/components/home/HubSectionLink";
import type { GameDayStatusItem } from "@/lib/gameDay/types";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { HUB_SECTION, hubSectionAnchorClassName } from "@/lib/home/hubSections";

export default function GameDayStatusStrip({
  items,
  title = "Today's Activity",
}: {
  items: GameDayStatusItem[];
  title?: string;
}) {
  return (
    <section id={HUB_SECTION.status} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title home-section-title">{title}</h2>
      <ul className="gd-status-grid">
        {items.map((item, index) => (
          <li key={item.id}>
            <HubSectionLink
              href={item.href ?? "#"}
              className={[
                "gd-status-card admin-stat-enter",
                item.highlight ? "gd-status-card-highlight" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="gd-status-emoji" aria-hidden>
                {item.emoji}
              </span>
              <span className="gd-status-value">{item.value}</span>
              <span className="gd-status-label">{item.label}</span>
            </HubSectionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GameDayAtmosphereBanner({
  emoji,
  label,
  tagline,
  theme,
}: {
  emoji: string;
  label: string;
  tagline: string;
  theme: string;
}) {
  return (
    <LandingGlassCard className={`gd-atmosphere gd-atmosphere-${theme} p-4 sm:p-5 mb-8`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>
          {emoji}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold">{label}</p>
          <p className="text-sm sm:text-base text-white mt-1">{tagline}</p>
        </div>
      </div>
    </LandingGlassCard>
  );
}
