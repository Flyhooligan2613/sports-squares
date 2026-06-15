"use client";

import HubSectionLink from "@/components/home/HubSectionLink";
import type { GameDaySnapshotCard } from "@/lib/gameDay/types";
import { HUB_SECTION, hubSectionAnchorClassName } from "@/lib/home/hubSections";

export default function GameDaySnapshotGrid({ cards }: { cards: GameDaySnapshotCard[] }) {
  if (!cards.length) return null;

  return (
    <section id={HUB_SECTION.snapshot} className={hubSectionAnchorClassName("mb-10 sm:mb-12")}>
      <h2 className="gd-section-title home-section-title">What Should I Do Next?</h2>
      <ul className="gd-snapshot-grid">
        {cards.map((card, index) => (
          <li key={card.id}>
            <HubSectionLink
              href={card.href}
              className={[
                "gd-snapshot-card admin-stat-enter",
                card.highlight ? "gd-snapshot-card-highlight" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span className="gd-snapshot-emoji" aria-hidden>
                {card.emoji}
              </span>
              <span className="gd-snapshot-title">{card.title}</span>
              {card.subtitle ? (
                <span className="gd-snapshot-subtitle">{card.subtitle}</span>
              ) : null}
            </HubSectionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
