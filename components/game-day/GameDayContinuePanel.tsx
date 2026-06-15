"use client";

import HubSectionLink from "@/components/home/HubSectionLink";
import { HUB_SECTION, hubSectionAnchorClassName } from "@/lib/home/hubSections";
import type { GameDayContinueItem } from "@/lib/gameDay/types";

export default function GameDayContinuePanel({
  items,
  title = "Continue Your Game Day",
  glowRewardDrop = false,
}: {
  items: GameDayContinueItem[];
  title?: string;
  glowRewardDrop?: boolean;
}) {
  if (!items.length) return null;

  return (
    <section id={HUB_SECTION.continue} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title home-section-title">{title}</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <HubSectionLink
              href={item.href}
              className={[
                "gd-continue-card block admin-stat-enter",
                item.urgent ? "gd-continue-card-urgent" : "",
                glowRewardDrop && (item.id === "drop" || item.id === "mystery")
                  ? "home-continue-glow"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xl shrink-0" aria-hidden>
                {item.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-sb-muted mt-0.5">{item.detail}</p>
              </div>
              <span className="text-sb-muted text-sm shrink-0" aria-hidden>
                →
              </span>
            </HubSectionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
