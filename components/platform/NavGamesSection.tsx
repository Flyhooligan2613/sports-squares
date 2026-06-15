"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import {
  isPlatformGameNavActive,
  PLATFORM_GAMES,
  type PlatformGameDefinition,
} from "@/lib/platform/gameTypes";
import { useNavDrawer } from "@/components/nav/NavDrawerProvider";

function NavGameCard({ game }: { game: PlatformGameDefinition }) {
  const pathname = usePathname();
  const { close } = useNavDrawer();
  const active = isPlatformGameNavActive(game, pathname);
  const isAvailable = game.status === "available" && game.href;

  const content = (
    <>
      <span className="nav-game-card-icon" aria-hidden>
        {game.icon}
      </span>
      <span className="nav-game-card-body">
        <span className="nav-game-card-name">{game.name}</span>
        <span
          className={[
            "nav-game-card-status",
            isAvailable ? "nav-game-card-status-vibe" : "nav-game-card-status-soon",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {game.tagline}
        </span>
      </span>
    </>
  );

  if (isAvailable && game.href) {
    return (
      <Link
        href={game.href}
        onClick={close}
        className={["nav-game-card", active ? "nav-game-card-active" : ""]
          .filter(Boolean)
          .join(" ")}
        style={{ "--nav-game-accent": game.accent } as CSSProperties}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className="nav-game-card nav-game-card-disabled"
      style={{ "--nav-game-accent": game.accent } as CSSProperties}
      aria-disabled="true"
    >
      {content}
    </div>
  );
}

export default function NavGamesSection({
  filter,
}: {
  filter: "available" | "coming_soon";
}) {
  const games = PLATFORM_GAMES.filter((game) =>
    filter === "available" ? game.status === "available" : game.status === "coming_soon"
  );

  if (games.length === 0) return null;

  return (
    <ul className="space-y-2 mb-3">
      {games.map((game) => (
        <li key={game.id}>
          <NavGameCard game={game} />
        </li>
      ))}
    </ul>
  );
}
