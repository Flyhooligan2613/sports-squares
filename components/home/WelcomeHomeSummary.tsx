"use client";

import type { GameDayStatusItem } from "@/lib/gameDay/types";

export default function WelcomeHomeSummary({ items }: { items: GameDayStatusItem[] }) {
  if (!items.length) return null;

  return (
    <div className="welcome-home-summary">
      <p className="welcome-home-summary-label">Today&apos;s Game Day</p>
      <ul className="welcome-home-summary-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={[
              "welcome-home-summary-item",
              item.highlight ? "welcome-home-summary-item-highlight" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span aria-hidden>{item.emoji}</span>
            <span className="welcome-home-summary-value">{item.value}</span>
            <span className="welcome-home-summary-text">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
