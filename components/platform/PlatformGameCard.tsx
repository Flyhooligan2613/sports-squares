"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { PlatformGameDefinition } from "@/lib/platform/gameTypes";

interface PlatformGameCardProps {
  game: PlatformGameDefinition;
  variant?: "home" | "compact";
  index?: number;
}

function statusLabel(game: PlatformGameDefinition): string {
  return game.status === "available" ? "Available Now" : "Coming Soon";
}

export default function PlatformGameCard({
  game,
  variant = "home",
  index = 0,
}: PlatformGameCardProps) {
  const isAvailable = game.status === "available" && game.href;
  const cardStyle = {
    "--platform-accent": game.accent,
    animationDelay: `${index * 60}ms`,
  } as CSSProperties;

  const inner = (
    <>
      <div
        className="platform-game-card-glow"
        style={{ background: `radial-gradient(circle at 30% 20%, ${game.accent}33, transparent 65%)` }}
        aria-hidden
      />
      <div className="platform-game-card-top">
        <span className="platform-game-card-icon" aria-hidden>
          {game.icon}
        </span>
        <span
          className={[
            "platform-game-card-badge",
            isAvailable ? "platform-game-card-badge-live" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {statusLabel(game)}
        </span>
      </div>
      <h3 className="platform-game-card-title">{game.name}</h3>
      <p className="platform-game-card-desc">{game.description}</p>
      {isAvailable ? (
        <span className="platform-game-card-cta">Play now →</span>
      ) : (
        <span className="platform-game-card-soon">Launching soon on SquareBoards</span>
      )}
    </>
  );

  const className = [
    "platform-game-card",
    variant === "compact" ? "platform-game-card-compact" : "",
    isAvailable ? "platform-game-card-active" : "platform-game-card-soon-state",
  ]
    .filter(Boolean)
    .join(" ");

  if (isAvailable && game.href) {
    return (
      <Link href={game.href} className={className} style={cardStyle}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} style={cardStyle} aria-disabled="true">
      {inner}
    </div>
  );
}
