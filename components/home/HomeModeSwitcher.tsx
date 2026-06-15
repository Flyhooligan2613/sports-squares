"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const HOME_HREF = "/my-games?mode=home";
const GAME_DAY_HREF = "/my-games?mode=gameday";

function isHomeModeActive(pathname: string, mode: string | null): boolean {
  return pathname === "/my-games" && mode === "home";
}

function isGameDayModeActive(pathname: string, mode: string | null): boolean {
  if (pathname !== "/my-games") return false;
  return mode === "gameday" || mode === null;
}

export default function HomeModeSwitcher({
  isGameDay,
  atmosphereLabel,
  variant = "badges",
}: {
  isGameDay?: boolean;
  atmosphereLabel?: string;
  variant?: "badges" | "bar";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const homeActive = isHomeModeActive(pathname, mode);
  const gameDayActive = isGameDayModeActive(pathname, mode);
  const gameDayLabel = isGameDay ? "Game Day Live" : atmosphereLabel ?? "Game Day";

  if (variant === "bar") {
    return (
      <nav className="player-home-nav" aria-label="Game Room and Game Day">
        <Link
          href={HOME_HREF}
          className={`player-home-nav-link ${homeActive ? "player-home-nav-link-active" : ""}`}
          aria-current={homeActive ? "page" : undefined}
        >
          Game Room
        </Link>
        <Link
          href={GAME_DAY_HREF}
          className={`player-home-nav-link ${gameDayActive ? "player-home-nav-link-active" : ""}`}
          aria-current={gameDayActive ? "page" : undefined}
        >
          {gameDayLabel}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Game Room and Game Day">
      <Link
        href={HOME_HREF}
        className={`home-badge home-badge-link ${homeActive ? "home-badge-active" : ""}`}
        aria-current={homeActive ? "page" : undefined}
      >
        Game Room
      </Link>
      <Link
        href={GAME_DAY_HREF}
        className={[
          "home-badge home-badge-link",
          isGameDay ? "home-badge-live" : "home-badge-calm",
          gameDayActive ? "home-badge-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-current={gameDayActive ? "page" : undefined}
      >
        {gameDayLabel}
      </Link>
    </nav>
  );
}
