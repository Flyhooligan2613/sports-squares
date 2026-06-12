"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import {
  isPlatformGameNavActive,
  PLATFORM_GAMES,
} from "@/lib/platform/gameTypes";
import { useNavDrawer } from "@/components/nav/NavDrawerProvider";

export default function NavGamesSection() {
  const pathname = usePathname();
  const { close } = useNavDrawer();

  return (
    <div className="nav-drawer-section">
      <p className="nav-drawer-section-title">Play</p>
      <ul className="space-y-2">
        {PLATFORM_GAMES.map((game) => {
          const active = isPlatformGameNavActive(game, pathname);
          const isAvailable = game.status === "available" && game.href;

          const statusLabel = game.navBadge === "new"
            ? "NEW"
            : isAvailable
              ? "Available Now"
              : "Coming Soon";

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
                    isAvailable ? "nav-game-card-status-live" : "",
                    game.navBadge === "new" ? "nav-game-card-status-new" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {statusLabel}
                </span>
              </span>
            </>
          );

          if (isAvailable && game.href) {
            return (
              <li key={game.id}>
                <Link
                  href={game.href}
                  onClick={close}
                  className={[
                    "nav-game-card",
                    active ? "nav-game-card-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ "--nav-game-accent": game.accent } as CSSProperties}
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={game.id}>
              <div
                className="nav-game-card nav-game-card-disabled"
                style={{ "--nav-game-accent": game.accent } as CSSProperties}
                aria-disabled="true"
              >
                {content}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
