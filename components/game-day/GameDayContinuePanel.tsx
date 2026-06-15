"use client";

import Link from "next/link";
import type { GameDayContinueItem } from "@/lib/gameDay/types";

export default function GameDayContinuePanel({ items }: { items: GameDayContinueItem[] }) {
  if (!items.length) return null;

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">Continue Playing</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={[
                "gd-continue-card block admin-stat-enter",
                item.urgent ? "gd-continue-card-urgent" : "",
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
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
