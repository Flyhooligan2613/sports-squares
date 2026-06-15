"use client";

import Link from "next/link";
import { useState } from "react";
import { GAME_ROOM_SPORTS } from "@/lib/home/gameRoomSports";

export default function GameRoomSportTabs() {
  const [activeId, setActiveId] = useState(GAME_ROOM_SPORTS[0]?.id ?? "nfl");
  const activeSport = GAME_ROOM_SPORTS.find((sport) => sport.id === activeId) ?? GAME_ROOM_SPORTS[0];

  if (!activeSport) return null;

  return (
    <section className="gameroom-sport-tabs" aria-label="Browse by sport">
      <div className="gameroom-sport-tabs-inner">
        <p className="gameroom-sport-tabs-kicker">Play by sport</p>
        <div className="gameroom-sport-tab-row" role="tablist" aria-label="Sports">
          {GAME_ROOM_SPORTS.map((sport) => {
            const selected = sport.id === activeId;
            return (
              <button
                key={sport.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={[
                  "gameroom-sport-tab",
                  selected ? "gameroom-sport-tab-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveId(sport.id)}
              >
                <span aria-hidden>{sport.emoji}</span>
                {sport.label}
              </button>
            );
          })}
        </div>

        <div
          className="gameroom-sport-links"
          role="tabpanel"
          aria-label={`${activeSport.label} games`}
        >
          {activeSport.links.map((link) =>
            link.available ? (
              <Link key={link.href + link.label} href={link.href} className="gameroom-sport-link">
                {link.label}
              </Link>
            ) : (
              <span key={link.label} className="gameroom-sport-link gameroom-sport-link-disabled">
                {link.label}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
