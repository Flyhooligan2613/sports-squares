"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import SportBackdrop from "@/components/sports/SportBackdrop";
import { Button } from "@/components/ui/Button";
import { GAME_ROOM_SPORTS } from "@/lib/home/gameRoomSports";

export default function GameRoomSportTabs() {
  const [activeId, setActiveId] = useState(GAME_ROOM_SPORTS[0]?.id ?? "nfl");
  const activeSport = GAME_ROOM_SPORTS.find((sport) => sport.id === activeId) ?? GAME_ROOM_SPORTS[0];

  if (!activeSport) return null;

  const availableLinks = activeSport.links.filter((link) => link.available);
  const panelId = `gameroom-sport-panel-${activeSport.id}`;

  return (
    <section className="gameroom-sport-tabs" aria-label="Browse by sport">
      <div className="gameroom-sport-tabs-inner">
        <p className="gameroom-sport-tabs-kicker">Play by sport</p>
        <p className="gameroom-sport-tabs-hint">Tap a sport, then choose what you want to play.</p>

        <div className="gameroom-sport-tab-row" role="tablist" aria-label="Sports">
          {GAME_ROOM_SPORTS.map((sport) => {
            const selected = sport.id === activeId;
            return (
              <button
                key={sport.id}
                type="button"
                role="tab"
                id={`gameroom-sport-tab-${sport.id}`}
                aria-selected={selected}
                aria-controls={panelId}
                className={[
                  "gameroom-sport-tab",
                  selected ? "gameroom-sport-tab-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveId(sport.id)}
              >
                <span className="gameroom-sport-tab-emoji" aria-hidden>
                  {sport.emoji}
                </span>
                {sport.label}
              </button>
            );
          })}
        </div>

        <div
          id={panelId}
          className="gameroom-sport-panel"
          role="tabpanel"
          aria-labelledby={`gameroom-sport-tab-${activeSport.id}`}
        >
          <SportBackdrop sportId={activeSport.id} variant="panel" />

          <div className="gameroom-sport-panel-content">
            <p className="gameroom-sport-panel-title">
              Choose what to play · <span>{activeSport.label}</span>
            </p>

            {availableLinks.length > 0 ? (
              <div className="gameroom-sport-actions">
              {availableLinks.map((link, index) => (
                <Button
                  key={link.href + link.label}
                  href={link.href}
                  prefetch
                  variant={index === 0 ? "primary" : "secondary"}
                  size="sm"
                  className="gameroom-sport-action-btn group"
                >
                  <span className="gameroom-sport-action-label">
                    {link.emoji ? (
                      <span className="gameroom-sport-action-emoji" aria-hidden>
                        {link.emoji}
                      </span>
                    ) : null}
                    {link.cta ?? `Play ${link.label}`}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Button>
              ))}
            </div>
          ) : (
            <p className="gameroom-sport-empty">More {activeSport.label} games are on the way.</p>
          )}

          {activeSport.links.some((link) => !link.available) ? (
            <div className="gameroom-sport-soon-row" aria-label="Coming soon">
              {activeSport.links
                .filter((link) => !link.available)
                .map((link) => (
                  <span key={link.label} className="gameroom-sport-soon-pill">
                    {link.label}
                  </span>
                ))}
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
