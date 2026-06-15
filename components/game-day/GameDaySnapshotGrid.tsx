"use client";

import Link from "next/link";
import type { GameDaySnapshotCard } from "@/lib/gameDay/types";

export default function GameDaySnapshotGrid({ cards }: { cards: GameDaySnapshotCard[] }) {
  if (!cards.length) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title home-section-title">What Should I Do Next?</h2>
      <ul className="gd-snapshot-grid">
        {cards.map((card, index) => (
          <li key={card.id}>
            <Link
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
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
